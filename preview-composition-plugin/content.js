(() => {
    const buttonTemplate = document.createElement('button');
    buttonTemplate.textContent = 'Show details';
    buttonTemplate.className = 'show-details';

    const detailsDivTemplate = document.createElement('div');
    detailsDivTemplate.className = 'product-details';

    function addShowDetailsButtons(root = document) {
        const products = root.querySelectorAll('.es-product');

        for (const product of products) {
            if (product.querySelector('.show-details')) continue;

            const button = buttonTemplate.cloneNode(true);
            const detailsDiv = detailsDivTemplate.cloneNode(true);
            product.append(button, detailsDiv);
        }
    }

    const productDataRegex = /window\['getProductData'\]\s*=\s*function\(\)\s*\{\s*return\s*(\{[\s\S]*?\})\s*;\s*\}/;
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.show-details');
        if (!button) return;

        const product = button.closest('.es-product');
        if (!product) return;

        const detailsDiv = product.querySelector('.product-details');
        const link = product.querySelector('a.es-product-photo')?.href;
        if (!link) {
            detailsDiv.textContent = 'Error loading details';
            return;
        }

        detailsDiv.textContent = 'Loading...';

        fetch(link)
            .then((result) => result.text())
            .then((resultHtml) => {
                const productDataContent = productDataRegex.exec(resultHtml);
                if (!productDataContent) {
                    detailsDiv.textContent = 'Error loading details';
                    return;
                }

                const resultJson = JSON.parse(productDataContent[1]);
                const composition_main_fabric = resultJson?.wclFabricComposition?.composition_main_fabric;
                if (composition_main_fabric) {
                    detailsDiv.textContent = `Main cloth composition: ${composition_main_fabric}`;
                    return;
                }

                const material = resultJson.material;
                if (material) {
                    detailsDiv.textContent = `Composition: ${material}`;
                    return;
                }

                detailsDiv.textContent = 'Error loading details';
            })
            .catch(() => {
                detailsDiv.textContent = 'Error loading details';
            });
    });

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                if (node.matches('.es-product')) {
                    addShowDetailsButtons(node.parentNode);
                } else {
                    addShowDetailsButtons(node);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    const style = document.createElement('style');
    style.textContent = `
        .show-details {
            margin-top: 8px;
            padding: 6px 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        .show-details:hover {
            background-color: #0056b3;
        }
        .product-details {
            margin-top: 6px;
        }
    `;
    document.head.appendChild(style);
    addShowDetailsButtons();
})();
