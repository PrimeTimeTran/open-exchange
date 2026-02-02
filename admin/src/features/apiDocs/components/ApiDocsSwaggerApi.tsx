'use client';

import React, { useEffect } from 'react';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';
import 'swagger-ui-dist/swagger-ui.css';

export default function ApiDocsSwaggerApi() {
  useEffect(() => {
    const ui = SwaggerUIBundle({
      url: '/api/api-docs',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout',
    });

    // @ts-ignore
    window.ui = ui;
  }, []);

  return (
    <>
      <div id="swagger-ui"></div>
    </>
  );
}
