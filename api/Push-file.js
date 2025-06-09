export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  try {
    const { path, content } = req.body;
    const token = process.env.MY_GH_TOKEN;

    const url = `https://api.github.com/repos/Dave8011/Codex/contents/${path}`;

    // Check if file exists
    const existing = await fetch(url, {
      headers: { Authorization: `token ${token}` }
    });

    const fileData = existing.status === 200 ? await existing.json() : null;

    const result = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Added or updated by Codex UI`,
        content: Buffer.from(content).toString("base64"),
        sha: fileData?.sha || undefined
      })
    });

    const data = await result.json();

    if (!result.ok) {
      return res.status(500).json({ message: "❌ GitHub API failed", error: data });
    }

    res.json({ message: "✅ File committed!" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "❌ Server error", error: err.message });
  }
}
