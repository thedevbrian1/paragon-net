import React, { createElement } from 'react';

export function ProductItem({ hit, components }) {
    console.log({ hit });
    console.log({ components });
    return (
        <a href={hit.url} className="aa-ItemLink">
            <div className="aa-ItemContent">
                <div class="aa-ItemIcon">
                    <img
                        src={hit.image}
                        // alt={item.name}
                        width="40"
                        height="40"
                    />
                </div>

                <div className="aa-ItemTitle">
                    <components.Highlight hit={hit} attribute="name" />
                </div>
            </div>
        </a>
    );
}
