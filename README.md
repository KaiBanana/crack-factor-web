# 合金裂纹因子预测

输入 wt.% 合金成分，Ni 自动计算为余量；提供 IN625 示例。点击开始计算后显示 10 秒等待动画，并输出 RF、SCI、HSC、SAC、γ′ 相含量（900 ℃）和 M₆C 最大相含量。

模型直接在浏览器运行，无需本地电脑作为后端。使用新版 Chrome、Edge、Firefox 或 Safari。

模型采用无损 gzip 压缩并分片存储在 `model/`；网页合并分片、解压、核对 SHA256 后运行。部署版本与本地已验证模型一致。

## GitHub Pages

在仓库 Settings → Pages → Build and deployment 中选择 **Deploy from a branch**，分支选择 **main**，目录选择 **/(root)**，保存即可。

预期站点地址：https://kaibanana.github.io/crack-factor-web/
