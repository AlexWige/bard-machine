<script>
    import GlobalStyles from "./GlobalStyles";
    import { onDestroy, onMount } from "svelte";
    export let onFolderLoaded;
    const { ipcRenderer } = window.require('electron');

    $: style = `--bg: ${GlobalStyles.bg};`
            + `--topBarHeight: ${GlobalStyles.topBarSize};`;

    function askForExistingFolder() {
        ipcRenderer.send('open-file-dialog');
    }

    function askForNewFolder() {
        ipcRenderer.send('open-file-dialog');
    }

    onMount(async () => {
        ipcRenderer.on('selected-directory', (event, path) => onFolderLoaded(path));
    })

    onDestroy(async () => {
        ipcRenderer.removeListener('selected-directory', (event, path) => onFolderLoaded(path))
    });

</script>

<div id="home-screen-view" style={style} class="custom-scroll">
    <div class="container">
        <img src="icon.svg" alt="Bard Machine Icon" class="center" id="logo"/>
        <h1 class="center">Bard Machine <span class="version">v0.5</span></h1>
        <div id="home-menu">
            <ul class="options">
                <li on:pointerup="{askForExistingFolder}">
                    <i class="icon-font icon-folder"></i>
                    <h3>Open collection</h3>
                    <div class="description">Open an existing sound folder.</div>
                </li>
                <li on:pointerup="{askForNewFolder}">
                    <i class="icon-font icon-new-folder"></i>
                    <h3>Create new collection</h3>
                    <div class="description">Create a new collection inside a folder.</div>
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
                margin-top: 80px;
            }

            @media (min-height: 800px) {
                margin-top: 120px;
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
                margin: 60px auto 10px auto;
                min-height: 100px;
                max-width: 400px;

                ul {
                    list-style: none;
                    text-indent: 0;
                    padding-left: 0;

                    li {
                        position: relative;
                        margin: 0;
                        padding: 15px; 
                        padding-left: 70px;

                        &:last-of-type {
                            padding-bottom: 25px;
                        }

                        h3 {
                            margin: 5px 0 0 0;
                        }

                        .icon-font::before {
                            display: block;
                            position: absolute;
                            left: 27px;
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
                                color: rgb(255, 211, 66);
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
