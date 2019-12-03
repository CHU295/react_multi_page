# 基于 create-react-app 脚手架搭建

1. npm run eject
使用自带命令展开脚手架

2. 修改/config/以下代码
```
// paths.js
+ const globby = require('url');

+ const entriesPath = globby.sync([resolveApp('src') + '/pages/**/index.js']).map(filePath => {
  let tmp = filePath.split('/');
  let name = tmp[tmp.length - 2];

  // 处理多层文件夹嵌套的页面
  let pFolderIdx = tmp.indexOf('pages')
  tmp = tmp.slice(pFolderIdx + 1, tmp.length - 1)

  return {path: filePath, name: tmp.join('/')}
});

module.exports = {
  - appIndexJs: resolveModule(resolveApp, 'src/index')
  + entriesPath
}
```

```
// /config/webpackDevServer.config.js
+ const files = paths.entriesPath;
+ const rewrites = files.map(({name, path}) => {
  return {
    from: new RegExp(`^\/${name}`),
    to: `/${name}.html`
  };
});

historyApiFallback: {
  // Paths with dots should still use the history fallback.
  // See https://github.com/facebook/create-react-app/issues/387.
    disableDotRule: true,
+   rewrites
},
```

```
// /config/webpack.config.js
module.exports = function (webpackEnv) {
  // 获取 entry
+ function getEntries(){
    const entries = {};
    const files = paths.entriesPath;
    files.forEach(({name, path}) => {
      entries[name] = [
        isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
        path,
      ].filter(Boolean);
    });
    return entries;
  }

+  const entries = getEntries()

+  const htmlPlugin = Object.keys(entries).map(name => {
    return new HtmlWebpackPlugin(Object.assign({}, {
        inject: true,
        template: paths.appHtml,
        chunks: [name, 0], // 只会插入名字中带 "0" 或者 带 name 的js 问题
        filename: `${name}.html`,
        title: `${name} html`,

      }, isEnvProduction
        ? {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
          }
        }
        : undefined));
  });
}

return {
  ...
-  entry: [
    isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
    paths.appIndexJs,
  ].filter(Boolean),
+  entry:entries,
  output: {
    ...
-   filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/bundle.js',
+   filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/[name].bundle.js',
    ...
  }
  ...
  plugins: [
-   new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
+ ...htmlPlugin,
  ]
}
```
```
// /scripts/start.js
// /scripts/build.js
- if (!checkRequiredFiles([paths.appHtml,  paths.appIndexJs])) {
    process.exit(1);
  }
+ paths.entriesPath.forEach(({path, name}) => {
    if (!checkRequiredFiles([paths.appHtml, path])) {
      process.exit(1);
    }
  })
```

3. 处理 /public/index.html
yarn add handlebars-loader --save

```
// webpack添加rule
{
  test: /.hbs$/,
  loader: require.resolve('handlebars-loader')
},
```