// Builds one HTML page from a step's HTML, CSS and JavaScript, for "See it run" and the download.
// No DOM code here, so it can be tested in Node.

/**
 * Text inside <script> and <style> ends at the first "</script" or "</style", even inside a JS string.
 * Escaping the slash keeps the code intact: "<\/script>" means the same thing in JS.
 */
export const escapeScript = (code) => code.replace(/<\/(script)/gi, '<\\/$1');
export const escapeStyle = (code) => code.replace(/<\/(style)/gi, '<\\/$1');


/** If the HTML is a full page (<html> or <body>), put the CSS and JS inside it; otherwise wrap the markup. */
export function buildDocument({ html = '', css = '', js = '' }, { head = '' } = {}) {
  const style = `<style>\n${escapeStyle(css)}\n</style>`;
  const script = js.trim() ? `<script>\n${escapeScript(js)}\n</script>` : '';
  const isFullPage = /<html[\s>]|<body[\s>]/i.test(html);

  if (!isFullPage) {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${head}
${style}
</head>
<body>
${html}
${script}
</body>
</html>`;
  }

  let page = html;
  const addToHead = `${head}\n${style}`;
  page = /<\/head>/i.test(page) ? page.replace(/<\/head>/i, `${addToHead}\n</head>`)
    : page.replace(/<body([\s>])/i, `<head>${addToHead}</head>\n<body$1`);
  page = /<\/body>/i.test(page) ? page.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${script}\n</body>`) : page + script;
  return page;
}
