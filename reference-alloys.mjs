// Nominal compositions, wt.%, reduced to the 13 elements accepted by this model.
// Unsupported elements are omitted and Ni is the remainder, exactly as in the input form.
// Cast alloys: https://patents.google.com/patent/US6217286B1/en (Table 2)
// CM 247LC: https://nickelinstitute.org/media/8d93486143182f5/nickel_incopub393_updated-june-2021.pdf (Table 1)
// IN625/IN718: Special Metals technical bulletins; Haynes 282: Haynes nominal composition.
export const referenceAlloys = [
  {name:'IN625', composition:{Cr:21.5,Mo:9,Nb:3.65,Al:0.2,Ti:0.2,C:0.03}},
  {name:'IN718', composition:{Cr:19,Mo:3.05,Nb:5.125,Al:0.5,Ti:0.9,C:0.04,B:0.003}},
  {name:'Haynes 282', composition:{Cr:20,Co:10,Mo:8.5,Al:1.5,Ti:2.1,C:0.06,B:0.005}},
  {name:'IN713C', composition:{Cr:12.5,Mo:4.2,Nb:2,Al:6.1,Ti:0.8,C:0.12,B:0.012,Zr:0.1}},
  {name:'IN939', composition:{Cr:22.5,Co:19,W:2,Ta:1.4,Nb:1,Al:1.9,Ti:3.7,C:0.15,B:0.009,Zr:0.09}},
  {name:'IN792', composition:{Cr:12.4,Co:9,Mo:1.9,W:3.8,Ta:3.9,Al:3.1,Ti:4.5,C:0.12,B:0.02,Zr:0.1}},
  {name:'IN100', composition:{Cr:10,Co:15,Mo:3,Al:5.5,Ti:4.7,C:0.18,B:0.014,Zr:0.06}},
  {name:'CM247LC', composition:{Cr:8,Co:9,Mo:0.5,W:10,Ta:3.2,Al:5.6,Ti:0.7,C:0.07,B:0.015,Zr:0.01,Hf:1.4}}
];
