import { AdapterMapDataType, AdapterTrieDataType, MiddlewareFunctionType } from "../type";
import MapRoute from "./methods/mapRoute";
import TrieRoute from "./methods/TrieRoute";
import Trie from "../utils/trie";

function Adapter(type: string, data: AdapterMapDataType): MiddlewareFunctionType {
  console.log(data); 
  if (type == 'map') {

    let m1 = new MapRoute(data);
    return m1.allocate;

  } else if (type == 'trie') {

    let tries = TriePorcess(data);
    let t1 = new TrieRoute(tries);
    // console.log('tree!!!!!!!!!!!!');

    return t1.allocate;
  }
  return () => { };
};

function TriePorcess(data: AdapterMapDataType) {
  // console.log(Object.keys(data),Object.values(data));
  let trie: AdapterTrieDataType = {
    Get: new Trie(),
    Post: new Trie(),
    Put: new Trie(),
    Patch: new Trie(),
    Delete: new Trie(),
    Options: new Trie(),
    Head: new Trie(),
    All: new Trie(),
  };

  for (let i in trie) {
    // console.log('trie==',trie[i],'data===',data[i as keyof AdapterDataType]);
    // trie[i].insert();
    for (let key in data[i as keyof AdapterMapDataType]) {
      // console.log(i,key, value);
      trie[i as keyof AdapterMapDataType].insert(key, ...data[i as keyof AdapterMapDataType][key]);
    }
  }
  return trie;
}

export default Adapter;