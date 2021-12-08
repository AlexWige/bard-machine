<script>
    import globalStyles from "./style/globalStyles";
    import { recentlyOpened } from "./collectionPaths";
    import collectionLoader from "./collectionLoader";
    import { fly } from "svelte/transition";
    import { onMount } from "svelte";
    const { ipcRenderer } = window.require('electron');

    $: style = `--bg: ${globalStyles.bg};`
        + `--topBarHeight: ${globalStyles.topBarSize};`
        + `--uiHighlightColor: ${globalStyles.uiHighlightColor};`
        + `--uiHighlightColorLighter: ${globalStyles.uiHighlightColor.saturate(0.3).lighten(0.1)};`
        + `--buttonColor: ${globalStyles.uiHighlightColor.saturate(0.3).darken(0.1)};`
        + `--buttonColorHover: ${globalStyles.uiHighlightColor.saturate(1.5).darken(0.25)};`;

        function getFilename(path) {
            return path.split('\\').pop().replace('.bmsounds', '');
        }

        onMount(async() => {
            collectionLoader.refreshRecentlyOpened();
        });
</script>

<div id="home-screen-view" style={style} class="custom-scroll">
    <div class="container">
        <img src="icon.svg" alt="Bard Machine Icon" class="center" id="logo"/>
        <h1 class="center">Bard Machine <span class="version">v0.5</span></h1>
        <div class="home-menu">        
            <ul id="home-options" in:fly="{{ x: -200 }}">
                <li on:click="{() => ipcRenderer.send('dialog-create-collection')}">
                    <i class="icon-font icon-new-file"></i>
                    <h3>Create new collection</h3>
                    <div class="description">Create a new empty file.</div>
                </li>
                <li on:click="{() => ipcRenderer.send('dialog-open-collection')}">
                    <i class="icon-font icon-folder"></i>
                    <h3>Open collection</h3>
                    <div class="description">Open an existing file.</div>
                </li>
            </ul>
            
            {#if $recentlyOpened && $recentlyOpened.length > 0}
                <div class="recently-opened">                
                    <h4>Recently opened</h4>
                    <ul>
                        {#each $recentlyOpened as path}
                            <li on:click={() => collectionLoader.openCollection(path)}>
                                <strong>{getFilename(path)}</strong> <span class="path">{path}</span>
                            </li>
                        {/each}
                    </ul>
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
            margin: 20px auto;

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
                margin: 15px auto;
                width: 90px;
            }

            h1 {
                margin-top: 0px;
                margin-bottom: 35px;
                font-size: 26px;

                .version {
                    font-weight: 400;
                    font-size: 14px;
                    margin-left: 5px;
                }
            }

            .home-menu {
                width: 80%;
                background-color: rgba(0,0,0,0.25);
                border-radius: 4px;
                margin: 10px auto;
                min-height: 80px;
                max-width: 380px;
                padding: 10px 25px;
                transition: 0.1s;
                overflow: hidden;
                    
                .recently-opened {
                    h4 {
                        margin-top: 35px;
                        margin-bottom: 8px;
                        font-size: 14px;
                        font-weight: 400;
                        color: white;
                        text-decoration: underline;
                    }

                    ul {
                        list-style: none;
                        text-indent: 8px;
                        margin-top: 0;
                        margin-bottom: 5px;
                        padding: 0;

                        &>li {
                            display: block;
                            position: relative;
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            overflow: hidden;
                            overflow-wrap: break-word;
                            word-break: break-all;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            height: 25px;
                            font-size: 11.5px;
                            font-style: italic;
                            color: #aaa;
                            
                            strong {
                                font-size: 14px;
                                font-weight: 500;
                                color:  var(--uiHighlightColor, #fff);
                            }

                            .path {
                                margin-left: 8px;
                            }

                            &:hover {
                                cursor: pointer;
                                color: #ccc;

                                strong {
                                    color: var(--uiHighlightColorLighter, #fff);
                                }
                            }
                        }
                    }
                }

                #home-options {
                    list-style: none;
                    text-indent: 0;
                    padding: 0;
                    margin: 0;

                    &>li {
                        position: relative;
                        margin: 0;
                        margin-top: 8px;
                        margin-bottom: 20px;
                        padding-left: 48px;

                        &:last-of-type {
                            margin-bottom: 12px;
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
                            content: '\e903';
                            transform: scale(0.95);
                        }

                        .icon-new-file::before {
                            content: '\e904';
                        }

                        h3 {
                            margin: 5px 0 0 0;
                            font-size: 16.5px;
                        }

                        .description {
                            font-size: 13px;
                            color: rgba(255, 255, 255, 0.8);
                        }

                        &:hover {
                            cursor: pointer;

                            h3, i {
                                color: var(--uiHighlightColor, #fff);
                            }

                            .description {
                                color:  #fff6da;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
