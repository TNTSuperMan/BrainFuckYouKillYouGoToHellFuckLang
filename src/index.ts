const def_numvar = /^(?<name>.+)(は|も)バカ。$/;
const def_strvar = /^(?<name>.+)(は|も)?死ね。$/;
const set = /^(?<target>.+)は(?<value>.+)ぐらい気持ち悪い。$/;
const add = /^(?<target>.+)は(?<value>.+)よりも?気持ち悪い。$/;
const sub = /^(?<target>.+)は(?<value>.+)よりは?マシ。$/;

const strset = /^(?<target>.+)は「(?<value>.+)」って言え。$/;
const print = /^(?<target>.+)、吐け。$/

type NumberVariable = {
    type: "number",
    name: string
}
type StringVariable = {
    type: "string",
    name: string
}
type Variable = NumberVariable | StringVariable;

export const executeJIT = (source: string) => eval(compile(source));

export const compile = (source: string): string => {
    const vars: Variable[] = [];

    const varof = (name: string) => {
        const v = vars.findIndex(e=>e.name==name);
        if(v != -1) return v;
        throw new Error("Not found var: "+name);
    }
    const v = (v: Variable) => 
        "_" + vars.indexOf(v)
    
    let code = "";
    for(const line of source.split("\r").join("").split("\n")){
        if(def_numvar.test(line)){
            vars.push({
                type: "number",
                name: def_numvar.exec(line)?.groups?.name ?? ""});
        }else if(def_strvar.test(line)){
            vars.push({
                type: "string",
                name: def_strvar.exec(line)?.groups?.name ?? ""});
        }else if(set.test(line)){
            const res = set.exec(line);
            const target = vars[varof(res?.groups?.target ?? "")];
            const value = vars[varof(res?.groups?.value ?? "")];
            if(target.type != value.type)
                throw new Error(`Type not equal: ${target.name} != ${value.name}`)
            code += `${v(target)}=${v(value)};`
        }else if(add.test(line)){
            const res = add.exec(line);
            const target = vars[varof(res?.groups?.target ?? "")];
            const value  = vars[varof(res?.groups?.value  ?? "")];
            if(target.type == "number" && value.type == "string")
                throw new Error(`Type not match: ${target.name} != ${value.name}`)
            code += `${v(target)}+=${v(value)};`
        }else if(sub.test(line)){
            const res = sub.exec(line);
            const target = vars[varof(res?.groups?.target ?? "")];
            const value  = vars[varof(res?.groups?.value  ?? "")];
            if(target.type != "number" && value.type != "number")
                throw new Error(`Type not match: ${target.name} != ${value.name}`)
            code += `${v(target)}-=${v(value)};`
        }else if(strset.test(line)){
            const res = strset.exec(line);
            const target = vars[varof(res?.groups?.target ?? "")];
            const value  = res?.groups?.value  ?? "";
            if(target.type != "string")
                throw new Error(`Type not string: ${target.type}`)
            code += `${v(target)}+=${JSON.stringify(value)};`
        }else if(print.test(line)){
            const res = print.exec(line);
            const target = vars[varof(res?.groups?.target ?? "")];
            code += `console.log(${v(target)});`
        }
    }
    const varcode = "var " + vars.map(e=>`${v(e)}=${e.type=="number"?"0":"''"}`).join(",") + ";"
    return varcode + code;
}