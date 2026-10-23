// A controller or model method can have the same name as a registry key, e.g. load() in
// catalog/controller/api/sale/order.js. PHP keeps them apart ($this->load() calls the method,
// $this->load->language() uses the loader); a JS property can only hold one of them. The value
// returned for such a name does both: calling it runs the method, reading a property from it reads
// the registry object (functions bound to it).
module.exports = function sharedName(method, receiver, service) {
    if (service === null || (typeof service != 'object' && typeof service != 'function')) {
        return method;
    }
    return new Proxy(function (...args) {
        return method.apply(receiver, args);
    }, {
        get: (target, property) => {
            const value = service[property];
            return typeof value == 'function' ? value.bind(service) : value;
        },
        set: (target, property, value) => {
            service[property] = value;
            return true;
        },
        has: (target, property) => property in service
    });
}
