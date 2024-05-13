import { ContextType, RouterFunction, RouterMethod, MiddlewareFunctionType } from "../type";

class TrieNode {
  value: RouterFunction[] | null = null;
  children: Map<string, TrieNode> = new Map<string, TrieNode>();
};

export default class Trie {
  root: TrieNode;
  
  constructor() {
    this.root = new TrieNode();
  }

  insert(value: string, ...fun: RouterFunction[]) {
    let str = value.split('/');
    let next = this.root;

    for (let i = 0; i < str.length; ++i) {
      if (next.children.has(str[i])) {

      } else {
        next.children.set(str[i], new TrieNode);
      }
      next = next.children.get(str[i]) as TrieNode;
      if (i == str.length - 1) {
        next.value = fun;
      }
    }
  }

  match(value: string): { params: { [key: string]: any }, funs: MiddlewareFunctionType[] } {
    // split request url
    let str = value.split('/');
    str.splice(0, 1);
    // get trie root
    let pCur = this.root.children.get('') as TrieNode;
    // init params object
    let params: { [key: string]: any } = {};

    if (!pCur) return { params, funs: [] };

    // match the split url string
    for (let i = 0; i < str.length; ++i) {
      if (pCur.children.has(str[i])) {
        let res = pCur.children.get(str[i]) as TrieNode;
        pCur = res;
        if (i == str.length - 1 && res.value !== null) {
          return { params, funs: res.value };
        }
      } else if (pCur.children) {
        let isFind = false;
        let keys = Array.from(pCur.children.keys());

        for (let j = 0; j < keys.length; ++j) {
          if (keys[j].startsWith(':')) {
            let res = pCur.children.get(keys[j]) as TrieNode;
            pCur = res;
            // get resfult params value
            params[keys[j].slice(1, keys[j].length)] = str[i];
            if (i == str.length - 1 && res.value !== null) {
              return { params, funs: res.value };
            }
            isFind = true;
            break;
          }
        }
        if (!isFind) return { params, funs: [] };
      } else {
        return { params, funs: [] };
      }
    }
    return { params, funs: [] };
  }
};