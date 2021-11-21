import { writable } from "svelte/store";

function gettableStore(value) {
	const { subscribe, set, update } = writable(value);

	return {
		subscribe,
        update,
        set,
        get() {
            let content;
            update(store => { content = store; return store; });
            return content;
        }
	};
}

export default gettableStore;