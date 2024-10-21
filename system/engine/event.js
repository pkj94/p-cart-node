module.exports = class Event {
    constructor(registry) {
        this.registry = registry;
        this.data = [];
    }
    register(trigger, action, priority = 0) {
        this.data.push({ trigger, action, priority });
        this.data.sort((a, b) => a.priority - b.priority);
    }
    trigger_old(event, args = []) {

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
    async trigger(event, args = []) {
        for (let value of this.data) {
            const triggerRegex = new RegExp('^' + value.trigger.replace(/\*|\?/g, match => (match === '*' ? '.*' : '.')));
            // if (event.indexOf('model/setting/startup/after') >= 0)
            //     console.log('1---', event, triggerRegex.test(event), '^' + value.trigger.replace(/\*|\?/g, match => (match === '*' ? '.*' : '.')))
            if (triggerRegex.test(event)) {
                try {
                    const result = await value.action.execute(this.registry, args);
                    if (result && result !== null && !(result instanceof Error)) {
                        return result;
                    }
                } catch (e) {
                    // Handle exception if needed
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