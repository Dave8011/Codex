export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { path, content } = req.body;
  if (!path || typeof content !== "string") {
    return res.status(400).json({ message: "Missing path or content" });
  }

  try {
    const token = process.env.MY_GH_TOKEN;
    const url = `https://api.github.com/repos/Dave8011/Codex/contents/${path}`;

    // Get file sha if exists
    let sha = null;
    const getFile = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });

    if (getFile.ok) {
      const data = await getFile.json();
      sha = data.sha;
    }

    const base64Content = Buffer.from(content).toString("base64");

    const putFile = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update ${path} via Codex`,
        content: base64Content,
        sha: sha || undefined,
      }),
    });

    const result = await putFile.json();

    if (!putFile.ok) {
      return res.status(putFile.status).json({
        message: "GitHub API error",
        error: result.message || result,
      });
    }

    return res.status(200).json({ message: "File saved successfully", result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
