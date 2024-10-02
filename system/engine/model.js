/**
 * @package     OpenCart
 * @author      Daniel Kerr
 * @copyright   Copyright (c) 2005 - 2022, OpenCart, Ltd. (https://www.opencart.com/)
 * @license     https://opensource.org/licenses/GPL-3.0
 * @link        https://www.opencart.com
*/
/**
* Model class
*/
/**
 * Class Model
 */
class Model {
    /**
     * @type {object|Opencart.System.Engine.Registry}
     */
    registry;
    /**
     * Constructor
     *
     * @param {object} registry
     */
    constructor(registry) {
        this.registry = registry;
    }
    /**
     * __get
     *
     * @param {string} key
     *
     * @return {object}
     */
    get(key) {
        if (this.registry.has(key)) {
            return this.registry.get(key);
        } else {
            throw new Error(`Error: Could not call registry key ${key}!`);
        }
    }
    /**
     * __set
     *
     * @param {string} key
     * @param {object} value
     *
     * @return {void}
     */
    set(key, value) {
        this.registry.set(key, value);
    }
}
// Export the Model class
export default Model;
