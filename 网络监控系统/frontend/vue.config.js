module.exports = {
    devServer: {
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/api'
                }
            }
        }
    },
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = '网络状态监控';
                return args;
            })
    },
    css: {
        loaderOptions: {
            scss: {
                additionalData: `@import "~@/assets/styles/variables.scss";`
            }
        }
    }
}