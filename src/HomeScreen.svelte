<script>
    import globalStyles from "./style/globalStyles";
    import { onDestroy, onMount } from "svelte";
    import collectionLoader from "./collectionLoader";
    const { ipcRenderer } = window.require('electron');
    import { fly } from "svelte/transition";
    
    export let onCollectionLoaded;

    $: style = `--bg: ${globalStyles.bg};`
        + `--topBarHeight: ${globalStyles.topBarSize};`
        + `--uiHighlightColor: ${globalStyles.uiHighlightColor};`
        + `--buttonColor: ${globalStyles.uiHighlightColor.saturate(0.3).darken(0.1)};`
        + `--buttonColorHover: ${globalStyles.uiHighlightColor.saturate(1.5).darken(0.25)};`;

    onMount(async () => {
        ipcRenderer.addListener('collection-open-path-selected', openCollection);
        ipcRenderer.addListener('collection-create-path-selected', createCollection);
    })

    onDestroy(async () => {
        ipcRenderer.removeListener('collection-open-path-selected', openCollection);
        ipcRenderer.removeListener('collection-create-path-selected', createCollection);
    });

    function createCollection(e, path) {
        collectionLoader.createCollection(path);
        onCollectionLoaded();
    }

    function openCollection(e, path) {
        collectionLoader.openCollection(path);
        onCollectionLoaded();
    }
</script>

<div id="home-screen-view" style={style} class="custom-scroll">
    <div class="container">
        <img src="icon.svg" alt="Bard Machine Icon" class="center" id="logo"/>
        <h1 class="center">Bard Machine <span class="version">v0.5</span></h1>
        <div id="home-menu">
            <ul id="home-options" in:fly="{{ x: -200 }}">
                <li on:click="{() => ipcRenderer.send('dialog-open-collection')}">
                    <i class="icon-font icon-folder"></i>
                    <h3>Open collection</h3>
                    <div class="description">Open an existing sound folder.</div>
                </li>
                <li on:click="{() => ipcRenderer.send('dialog-create-collection')}">
                    <i class="icon-font icon-new-folder"></i>
                    <h3>Create new collection</h3>
                    <div class="description">Create a new sound folder.</div>
                </li>
            </ul>
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
            }
        }
    }
</style>
