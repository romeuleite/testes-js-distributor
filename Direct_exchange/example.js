// Função que calcula o delta de uma equação de segundo grau
function calculateDelta(a, b, c) {
    const delta = b * b - 4 * a * c;
    return delta;
}

// Função que calcula as raízes usando o delta
function calculateRoots(a, b, c) {
    const delta = calculateDelta(a, b, c);

    if (delta < 0) {
        return 'A equação não possui raízes reais';
    } else if (delta === 0) {
        const root = -b / (2 * a);
        return `A equação possui uma raiz real: ${root}`;
    } else {
        const root1 = (-b + Math.sqrt(delta)) / (2 * a);
        const root2 = (-b - Math.sqrt(delta)) / (2 * a);
        return `A equação possui duas raízes reais: ${root1} e ${root2}`;
    }
}
