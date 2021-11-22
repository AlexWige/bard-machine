<script>
    import { onMount, onDestroy } from "svelte";
    import soundStore from "./soundStore";
    import _ from 'lodash';
    import { apis } from "./playerStore";

    onMount(async () => {
        window.addEventListener('click', onLeftClick);
        window.addEventListener('contextmenu', onRightClick);
    });

    onDestroy(async () => {
        window.removeEventListener('click', onLeftClick);
        window.removeEventListener('contextmenu', onRightClick);
    });

    function onLeftClick(e) {
        
        apis.contextMenu.hide();
        const soundBlock = getClickedSoundBlock(e.path);

        
        if(!e.ctrlKey) {
            if(!soundBlock || !(soundBlock.api().isSelected() && soundStore.getSelectedItems().length == 1)) {
                deselectAll();
            }
        }

        if(soundBlock) {
            if(soundBlock.api().clickEventCanSelect(e)) {
                soundBlock.api().toggleSelected();
            }
        } else {
            deselectAll();
        }
    }

    function onRightClick(e) {
        apis.contextMenu.hide();
        const soundBlock = getClickedSoundBlock(e.path);
        
        if(!soundBlock || (soundBlock && !soundStore.getSelectedItems().includes(soundBlock))) {
            deselectAll();
        }

        if(soundBlock) {
            soundBlock.api().setSelected(true);
        }

        apis.contextMenu.show(e.clientX, e.clientY);
    }

    function deselectAll() {
        soundStore.update(store => {
            store.forEach(item => {
                if(item.api().isSelected) item.api().setSelected(false);
            }); 
            return store;
        });
    }

    function getClickedSoundBlock(path) {
        const blockNode = path.find(node => {
            if(!node || !node.classList || !node.classList.contains) return false;
            return node.classList.contains('sound-block');
        });
        if(!blockNode || !blockNode.dataset.id) return undefined;
        return soundStore.getItemByID(blockNode.dataset.id);
    }
</script>