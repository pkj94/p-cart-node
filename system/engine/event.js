module.exports = class Event {
    constructor(registry) {
        this.registry = registry;
        this.data = [];
    }
    register(trigger, action, priority = 0) {
        this.data.push({ trigger, action, priority });
        this.data.sort((a, b) => a.priority - b.priority);
    }
    trigger(event, args = []) {
        for (const { trigger, action } of this.data) {
            if (new RegExp('^' + trigger.replace(/[\*\?]/g, (m) => ({ '*': '.*', '?': '.' }[m])) + '$').test(event)) {
                const result = action.execute(this.registry, args);
                if (result !== null && !(result instanceof Error)) {
                    return result;
                }
            }
        }
        return '';
    }
    unregister(trigger, route) {
        this.data = this.data.filter((item) => !(item.trigger === trigger && item.action.getId() === route));
    }
    clear(trigger) {
        this.data = this.data.filter((item) => item.trigger !== trigger);
    }
};