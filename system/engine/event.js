module.exports = class Event {
    constructor(registry) {
        this.registry = registry;
        this.data = [];
    }

    register(trigger, action, priority = 0) {
        this.data.push({ trigger, action, priority });
        this.data.sort((a, b) => a.priority - b.priority);
    }

    async trigger(event, args = []) {
        for (const { trigger, action } of this.data) {
            const pattern = new RegExp(`^${trigger.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);

            if (pattern.test(event)) {
                // if (event.indexOf('view/common/home/before') >= 0)
                //     console.log('1---', event, trigger, pattern, pattern.test(event), action)

                const result = await action.execute(this.registry, args);
                // if (event.indexOf('view/common/home/before') >= 0)
                //     console.log(result)
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

