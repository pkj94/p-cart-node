module.exports = class Event {
    constructor(registry) {
        this.registry = registry;
        this.data = [];
    }

    register(trigger, action, priority = 0) {
        // Compiled once here: trigger() runs twice for every model call and every view, and building
        // the pattern of each registered event there took ~10% of the CPU time of a page
        const pattern = new RegExp(`^${trigger.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
        this.data.push({ trigger, action, priority, pattern });
        this.data.sort((a, b) => a.priority - b.priority);
    }

    async trigger(event, args = []) {
        for (const { action, pattern } of this.data) {
            if (pattern.test(event)) {
                const result = await action.execute(this.registry, args);
                if (result && result !== null && !(result instanceof Error)) {
                    return result;
                }
            }
        }
        return null;
    }

    unregister(trigger, route) {
        this.data = this.data.filter(({ trigger: t, action }) => !(t === trigger && action.name === route));
    }

    clear(trigger) {
        this.data = this.data.filter(({ trigger: t }) => t !== trigger);
    }
}

