export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  const { path, content } = req.body;

  const token = process.env.GITHUB_TOKEN; // stored in Vercel project settings

  const url = `https://api.github.com/repos/Dave8011/Codex/contents/${path}`;

  // Check if file exists (for update vs create)
  const existing = await fetch(url, {
    headers: { Authorization: `token ${token}` },
  });
  const fileData = existing.status === 200 ? await existing.json() : null;

  const result = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Updated via Codex UI`,
      content: Buffer.from(content).toString("base64"),
      sha: fileData?.sha || undefined
    })
  });

  const response = await result.json();
  if (response.commit) {
    res.json({ message: "✅ File committed to GitHub!" });
  } else {
    res.status(500).json({ message: "❌ Failed", error: response });
  }
}
