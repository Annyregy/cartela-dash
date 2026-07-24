let domGuardsInstalled = false;

export function installDomMutationGuards() {
  if (domGuardsInstalled || typeof Node === "undefined") return;

  const proto = Node.prototype as typeof Node.prototype & {
    __granjaPosDomGuards?: boolean;
  };

  if (proto.__granjaPosDomGuards) {
    domGuardsInstalled = true;
    return;
  }

  const originalRemoveChild = proto.removeChild;
  const originalInsertBefore = proto.insertBefore;

  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        try {
          return originalRemoveChild.call(child.parentNode, child) as T;
        } catch {
          return child;
        }
      }
      return child;
    }

    try {
      return originalRemoveChild.call(this, child) as T;
    } catch {
      return child;
    }
  };

  proto.insertBefore = function <T extends Node>(this: Node, node: T, child: Node | null): T {
    if (child && child.parentNode !== this) {
      return this.appendChild(node) as T;
    }
    return originalInsertBefore.call(this, node, child) as T;
  };

  proto.__granjaPosDomGuards = true;
  domGuardsInstalled = true;
}

export function openExternalUrl(url: string) {
  if (typeof document === "undefined") return;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  window.requestAnimationFrame(() => {
    const parent = anchor.parentNode;
    if (parent) parent.removeChild(anchor);
  });
}

export async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") return;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    const parent = textarea.parentNode;
    if (parent) parent.removeChild(textarea);
  }
}