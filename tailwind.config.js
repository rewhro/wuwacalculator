module.exports = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            transitionProperty: {
                'colors': 'background-color, border-color, color, fill, stroke',
            },
        },
    },
    plugins: [],
};