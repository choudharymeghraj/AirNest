const app = require('./app');

// Wait for the initialization promise (initializeSession) to complete
setTimeout(() => {
  const routes = [];
  
  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(print.bind(null, path + (path === '/' ? '' : '/') + layer.route.path));
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(print.bind(null, path + (path === '/' ? '' : '/') + (layer.regexp.source || '')));
    } else if (layer.method) {
      routes.push(`${layer.method.toUpperCase()} ${path}`);
    }
  }

  app._router.stack.forEach(print.bind(null, ''));
  console.log("REGISTERED ROUTES:\n", routes.join('\n'));
  process.exit(0);
}, 2000);
