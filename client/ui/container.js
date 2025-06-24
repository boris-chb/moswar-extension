export function createContainer({ title, children = [] }) {
  const container = $(`<div class="block-bordered">
    <ins class="t l"><ins></ins></ins><ins class="t r"><ins></ins></ins>
    <div class="center clear">
      <h3>${title}</h3>
      <div class="petarena-training-description"></div>
    </div>
    <ins class="b l"><ins></ins></ins><ins class="b r"><ins></ins></ins>
  </div>`);

  const content = container.find(".petarena-training-description");
  children.forEach((child) => content.append(child));
  return container;
}
