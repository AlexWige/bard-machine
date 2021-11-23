<script>
    import { onMount, onDestroy } from "svelte";
    import soundStore from "./soundStore";
    import _ from 'lodash';
    import { apis } from "./playerStore";
    import { bind } from "svelte/internal";

    let lastSelectedBlock;

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
        
        if(!e.ctrlKey && !e.shiftKey) {
            if(!soundBlock || !(soundBlock.api.isSelected() && soundStore.getSelectedItems().length == 1)) {
                deselectAll();
            }
        }

        if(soundBlock) {
            if(soundBlock.api.clickEventCanSelect(e)) {
                soundBlock.api.toggleSelected();
                if(e.shiftKey && lastSelectedBlock) {
                    const blockRange = getRangeBetweenBlocks(lastSelectedBlock, soundBlock);
                    blockRange.forEach(block => {
                        block.api.setSelected(true);
                    });
                }
                if(soundBlock.api.isSelected()) lastSelectedBlock = soundBlock;
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
            soundBlock.api.setSelected(true);
            lastSelectedBlock = soundBlock;
        }

        apis.contextMenu.show(e.clientX, e.clientY);
    }

    function deselectAll() {
        soundStore.update(store => {
            store.forEach(item => {
                if(item.api.isSelected) item.api.setSelected(false);
            }); 
            return store;
        });
    }

    function getRangeBetweenBlocks(a, b) {
        if(!a || !b || a == b) return [];
        let soundBlockDOMList = [].slice.call(document.getElementsByClassName('sound-block'));
        const aIndex = soundBlockDOMList.indexOf(a.api.getDOM().soundBlock);
        const bIndex = soundBlockDOMList.indexOf(b.api.getDOM().soundBlock);
        const rangeStart = Math.min(aIndex, bIndex);
        const rangeEnd = Math.max(aIndex, bIndex);
        soundBlockDOMList = soundBlockDOMList.slice(rangeStart, rangeEnd + 1);
        return soundBlockDOMList.map(el => getSoundBlockFromDOMElement(el));
    }

    function getClickedSoundBlock(path) {
        const blockNode = path.find(node => {
            if(!node || !node.classList || !node.classList.contains) return false;
            return node.classList.contains('sound-block');
        });
        return getSoundBlockFromDOMElement(blockNode);
    }

    function getSoundBlockFromDOMElement(element) {
        if(!element || !element.dataset.id) return undefined;
        return soundStore.getItemByID(element.dataset.id);
    }
</script>