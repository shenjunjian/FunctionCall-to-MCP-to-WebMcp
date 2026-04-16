/** 开发一个 vue3的跳动指令，  用法为：
 * const isBouncing =ref(false)
 *
 * <div v-debounce="isBouncing">
 *   点击我
 * </div>
 *
 * 点击后，isBouncing 会变成 true，  监听动画结束事件，  再把 isBouncing 变成 false，
 *
 * 也可以用点击模式，就不用监听变量了
 *  <div v-debounce.click">
 *   点击我
 * </div>
 *
 * debounce效果的类名已经写好了，是 animate__animated animate__bounce，  直接使用即可。
 */

import { type Directive, type DirectiveBinding } from "vue";
interface BounceEl extends HTMLElement {
  _bounceCleanup?: () => void;
}
const bounceClass = "animate__animated animate__bounce".split(" ");

export const vBounce: Directive<BounceEl, boolean, "click"> = {
  mounted(el: BounceEl, binding: DirectiveBinding<boolean>) {
    // 监听动画结束
    const onAnimationEnd = () => el.classList.remove(...bounceClass);

    const handleClick = () => {
      el.classList.add(...bounceClass);
    };

    el.addEventListener("animationend", onAnimationEnd);

    if (binding.modifiers.click) {
      el.addEventListener("click", handleClick);
    }

    // 保存清理函数
    el._bounceCleanup = () => {
      el.removeEventListener("animationend", onAnimationEnd);
      if (binding.modifiers.click) {
        el.removeEventListener("click", handleClick);
      }
    };
  },
  updated(el, binding, vnode, prevVnode) {
    if (!binding.modifiers.click && binding.value) {
      el.classList.add(...bounceClass);
    }
  },
  unmounted(el: BounceEl) {
    el._bounceCleanup?.();
  },
};

export default vBounce;
