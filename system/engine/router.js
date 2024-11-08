module.exports = class Router {
    constructor(registry) {
        this.registry = registry;
        this.preActions = [];
        this.error = null;
    }

    addPreAction(preAction) {
        this.preActions.push(preAction);
    }

    async dispatch(action, error) {
        this.error = error;

        for (let preAction of this.preActions) {
            const result = await this.execute(preAction);
            if (result instanceof Action) {
                action = result;
                break;
            }
        }

        while (action instanceof Action) {
            action = await this.execute(action);
        }
    }

    async execute(action) {
        const result = await action.execute(this.registry);

        if (result instanceof Action) {
            return result;
        }

        if (result instanceof Error) {
            const action = this.error;
            this.error = null;
            return action;
        }

        return null;
    }
}
