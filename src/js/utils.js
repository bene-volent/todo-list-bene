function clearInner(node) {
    while (node.hasChildNodes()) {
        clear(node.firstChild);
    }
}

function clear(node) {
    while (node.hasChildNodes()) {
        clear(node.firstChild);
    }
    node.parentNode.removeChild(node);
}

export function removeAllChildren(element) {
    clearInner(element)
}

export function saveInLocalStorage(key,data){
    localStorage.setItem(key,data)
}
export function getFromLocalStorage(key){
    return JSON.parse(localStorage.getItem(key))
}