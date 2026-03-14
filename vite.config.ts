import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src'],
            outDir: 'dist',
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'CircularMenu',
            formats: ['es', 'cjs'],
            fileName: (format) => `circular-menu.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                exports: 'named',
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                },
            },
        },
        cssCodeSplit: false,
    },
});
