# 合金裂纹因子预测

输入 wt.% 合金成分，Ni 自动计算为余量；提供 IN625 示例。点击开始计算后显示 10 秒等待动画，并输出 RF、SCI、HSC、SAC、γ′ 相含量（900 ℃）和 M₆C 最大相含量。

模型直接在浏览器运行，无需本地电脑作为后端。使用新版 Chrome、Edge、Firefox 或 Safari。

模型采用无损 gzip 压缩并分片存储在 `model/`；网页合并分片、解压、核对 SHA256 后运行。部署版本与本地已验证模型一致。

页面四张分布图的灰点由本项目 `data.csv` 中 6,488 条热力学计算记录生成，保存为 `chart-data.json`。RF 和 SAC 只取计算状态为 `ok` 的记录。黑点由 `reference-alloys.mjs` 中八种代表合金的成分用当前浏览器模型计算；新计算的合金显示为红点。SAC 坐标乘以 1000 以便阅读，显示范围覆盖数据密集区。模型不支持 Fe、V、Re 等元素，参考成分中的未支持元素省略，Ni 自动取余量，因此标注点代表当前模型输入下的近似合金，而非标准牌号的完整配方。

参考成分来源：[Special Metals IN625](https://www.specialmetals.com/documents/technical-bulletins/inconel/inconel-alloy-625.pdf)、[Special Metals IN718](https://www.specialmetals.com/documents/technical-bulletins/inconel/inconel-alloy-718.pdf)、[Haynes 282](https://haynesintl.com/en/alloys/alloy-portfolio/high-temperature-alloys/haynes-282/)、[铸造合金成分表（IN713C、IN939、IN792、IN100）](https://patents.google.com/patent/US6217286B1/en)、[Nickel Institute CM247LC 成分表](https://nickelinstitute.org/media/8d93486143182f5/nickel_incopub393_updated-june-2021.pdf)。数值选自代表值或牌号范围中值，详细输入见 `reference-alloys.mjs`。

## GitHub Pages

在仓库 Settings → Pages → Build and deployment 中选择 **Deploy from a branch**，分支选择 **main**，目录选择 **/(root)**，保存即可。

预期站点地址：https://kaibanana.github.io/crack-factor-web/
