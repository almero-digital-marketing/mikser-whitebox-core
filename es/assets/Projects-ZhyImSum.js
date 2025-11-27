import { createElementBlock, openBlock, createElementVNode, createTextVNode, toDisplayString } from "vue";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = {};
const _hoisted_1 = { class: "projects" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1, [
    _cache[2] || (_cache[2] = createElementVNode("h2", null, "PROJECTS", -1)),
    createTextVNode(" " + toDisplayString(_ctx.$document.meta.title) + " ", 1),
    createElementVNode("p", null, [
      _cache[0] || (_cache[0] = createTextVNode("Projects: ")),
      createElementVNode("strong", null, toDisplayString(_ctx.$collections.items.loaded), 1),
      _cache[1] || (_cache[1] = createTextVNode(" Count: ")),
      createElementVNode("strong", null, toDisplayString(_ctx.$collections.items.length), 1)
    ])
  ]);
}
const Projects = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
export {
  Projects as default
};
