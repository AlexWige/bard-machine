<script>
    import GlobalStyles from "./GlobalStyles";
    import { onDestroy, onMount } from "svelte";
    import fileLoader from "./fileLoader";
    const { ipcRenderer } = window.require('electron');
    import { fly } from "svelte/transition";
    
    export let onFolderLoaded;
    let showCreateMenu = false;
    let createFolderLocation = "";
    let newCollectionName = "Bard Machine Collection";

    $: displayedFolderLabel = createFolderLocation != "" ? 
        `"${maxSizeText(createFolderLocation, 90)}"` 
        : 'Choose a location for your sound collection.';

    $: collectionPath = fileLoader.collectionPath;
    $: style = `--bg: ${GlobalStyles.bg};`
        + `--topBarHeight: ${GlobalStyles.topBarSize};`
        + `--uiHighlightColor: ${GlobalStyles.uiHighlightColor};`
        + `--buttonColor: ${GlobalStyles.uiHighlightColor.saturate(0.3).darken(0.1)};`
        + `--buttonColorHover: ${GlobalStyles.uiHighlightColor.saturate(1.5).darken(0.25)};`;

    function openExistingFolder(path) {
        collectionPath.set(path);
        onFolderLoaded(path);
    }

    function onNewFolderLocationSelected(path) {
        createFolderLocation = path;
    }

    function createFolder() {
        fileLoader.createFolders(createFolderLocation, newCollectionName, openExistingFolder);
    }

    function maxSizeText(input, max) {
        if (input.length > max) {
            return input.substring(0, max) + '...';
        }
        return input;
    };

    onMount(async () => {
        ipcRenderer.on('open-collection-directory', (e, path) => openExistingFolder(path));
        ipcRenderer.on('selected-tocreate-directory', (e, path) => onNewFolderLocationSelected(path));
    })

    onDestroy(async () => {
        ipcRenderer.removeListener('open-collection-directory', (e, path) => openExistingFolder(path));
        ipcRenderer.removeListener('selected-tocreate-directory', (e, path) => onNewFolderLocationSelected(path));
    });
</script>

<div id="home-screen-view" style={style} class="custom-scroll">
    <div class="container">
        <img src="icon.svg" alt="Bard Machine Icon" class="center" id="logo"/>
        <h1 class="center">Bard Machine <span class="version">v0.5</span></h1>
        <div id="home-menu">
            {#if !showCreateMenu}
            <ul id="home-options" in:fly="{{ x: -200 }}">
                <li on:click="{() => ipcRenderer.send('dialog-open-folder')}">
                    <i class="icon-font icon-folder"></i>
                    <h3>Open collection</h3>
                    <div class="description">Open an existing sound folder.</div>
                </li>
                <li on:click="{() => showCreateMenu = !showCreateMenu}">
                    <i class="icon-font icon-new-folder"></i>
                    <h3>Create new collection</h3>
                    <div class="description">Create a new sound folder.</div>
                </li>
            </ul>
            {:else}
            <div id="create-collection" in:fly="{{ x: 200 }}">
                <div class="option">
                    <label for="collection-name">
                        <h4>Collection Name</h4>
                        <div>Choose a name for your sound collection.</div>
                    </label>
                    <input type="text" name="collection-name" placeholder="Sound Collection Name" bind:value={newCollectionName}/>
                </div>
                <div class="option">
                    <label for="folder-dialog">
                        <h4>Location</h4>
                        <div class="location">{displayedFolderLabel}</div>
                    </label>
                    <button name="folder-dialog" on:click={() => ipcRenderer.send('dialog-create-folder')}>Choose folder</button>
                </div>
                <div class="option last-row">
                    <div class="back-btn">
                        <div class="back" on:click={() => showCreateMenu = !showCreateMenu}>&lt; &nbsp;Go back</div>
                    </div>
                    <button class="big" class:active={createFolderLocation != ""} on:click="{() => { if(createFolderLocation != "") createFolder();}}">Create</button>
                </div>
            </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    #home-screen-view {
        position: fixed;
        background-color: var(--bg, #333);
        top: var(--topBarHeight, 25);
        bottom: 0;
        width: 100%;
        overflow-x: hidden;
        overflow-y: auto;

        .container {
            width: 95%;
            max-width: 800px;
            margin: 25px auto;

            @media (min-height: 600px) {
                margin-top: 60px;
            }

            @media (min-height: 800px) {
                margin-top: 90px;
            }

            .center {
                text-align: center;
                margin: inherit auto;
            }

            #logo {
                display: block;
                margin: 10px auto;
                width: 100px;
            }

            h1 {
                margin-top: 0px;

                .version {
                    font-weight: 400;
                    font-size: 14px;
                    margin-left: 5px;
                }
            }

            #home-menu {
                width: 80%;
                background-color: rgba(0,0,0,0.25);
                border-radius: 4px;
                margin: 40px auto 10px auto;
                min-height: 80px;
                max-width: 380px;
                padding: 10px 25px;
                transition: 0.1s;
                overflow: hidden;

                h3 {
                    margin: 5px 0 0 0;
                }

                #home-options {
                    list-style: none;
                    text-indent: 0;
                    padding: 0;
                    margin: 0;

                    li {
                        position: relative;
                        margin: 0;
                        margin-top: 12px;
                        margin-bottom: 30px;
                        padding-left: 48px;

                        &:last-of-type {
                            margin-bottom: 16px;
                        }

                        .icon-font::before {
                            display: block;
                            position: absolute;
                            left: 5px;
                            top: 50%;
                            margin-top: -15px;
                            font-family: 'icomoon';
                            font-size: 24px;
                        }

                        .icon-folder::before {
                            content: '\e930';
                        }

                        .icon-new-folder::before {
                            content: '\e931';
                        }

                        .description {
                            font-size: 14px;
                            color: rgba(255, 255, 255, 0.8);
                        }

                        &:hover {
                            cursor: pointer;

                            h3, i {
                                color: var(--uiHighlightColor, #fff);
                            }

                            .description {
                                font-size: 14px;
                                color:  #fff6da;
                            }
                        }
                    }
                }

                #create-collection {
                    position: relative;
                    width: 100%;

                    h3 {
                        margin-bottom: 10px;
                        font-size: 20px;
                    }

                    .option {
                        display: block;
                        width: 100%;
                        padding: 5px 0;

                        label {
                            margin: 0 0 8px 0;

                            h4 {
                                font-size: 16px;
                                margin: 5px 0 0 1px;
                                color: var(--uiHighlightColor, #fff);
                            }

                            div {
                                color: rgba(255, 255, 255, 0.75);
                                font-size: 13.5px;
                                padding-left: 1px;

                                &.location {
                                    word-wrap: break-word;
                                }
                            }
                        }

                        input[type=text] {
                            font-size: 15px;
                            padding: 4px 8px;
                            width: 100%;

                            &::placeholder {
                                font-style: italic;
                            }
                        }

                        &.last-row {
                            position: relative;
                            height: 40px;
                            width: 100%;
                            margin-top: 15px;
                            margin-bottom: -8px;

                            button {
                                position: absolute;
                                top: 0;
                                right: 0;
                                width: 150px;
                                background-color: #333;
                                color: #888;
                                font-weight: 400;
                                cursor: default;

                                &:hover {
                                    background-color: #333;
                                }

                                &.active {
                                    background-color: var(--buttonColor, #fff);
                                    color: #000000dd;
                                    font-weight: 500;
                                    cursor: pointer;

                                    &:hover {
                                        background-color: var(--buttonColorHover, #fff)
                                    }
                                }
                            }

                            div {
                                position: absolute;
                                top: 4px;
                                left: 0;
                                width: 150px;

                                .back {
                                    cursor: pointer;
                                    font-size: 15px;
                                    opacity: 0.8;

                                    &:hover {
                                        opacity: 1;
                                        text-decoration: underline;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>
