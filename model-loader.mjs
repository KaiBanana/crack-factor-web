export async function loadModel() {
  if (typeof DecompressionStream === 'undefined') throw new Error('请使用新版 Chrome、Edge、Firefox 或 Safari 浏览器');
  const manifestResponse = await fetch('./model/manifest.json');
  if (!manifestResponse.ok) throw new Error('模型目录加载失败');
  const manifest = await manifestResponse.json();
  const chunks = await Promise.all(manifest.parts.map(async part => {
    const response = await fetch(`./model/${part}`);
    if (!response.ok) throw new Error('模型文件加载失败');
    return response.arrayBuffer();
  }));
  const compressed = new Blob(chunks);
  const json = await new Response(compressed.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  const bytes = new TextEncoder().encode(json);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2,'0')).join('');
  if (sha !== manifest.sha256) throw new Error('模型文件校验失败，请刷新重试');
  return JSON.parse(json);
}
