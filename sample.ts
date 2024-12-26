import { compile } from "./src";
const r = compile(`
a死ね。
aは「Hello, World!」って言え。
a、吐け。
`)
eval(r)