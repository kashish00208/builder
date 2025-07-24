import { FileItem } from "@/types";
import { FileSystemTree } from "@webcontainer/api";
export function toWebContainerMount(files: FileItem[]):FileSystemTree {
  const tree : FileSystemTree = {}
  for(const file of files){
    tree[file.path] = {
      file:{
        contents:file.content || ""
      }
    }
  }
  return tree;
}
export default toWebContainerMount;