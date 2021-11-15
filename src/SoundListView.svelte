<script>
    import BottomBar from "./BottomBar.svelte";
    import SoundBlock from "./SoundBlock.svelte";
    import GlobalStyles from "./GlobalStyles";
    import InputPrompt from "./InputPrompt.svelte";
    import soundStore from "./soundStore";

    let inputPrompt;

    $: style = `--bg: ${GlobalStyles.bg};`
            + `--topBarHeight: ${GlobalStyles.topBarSize};`
            + `--musicColor: ${GlobalStyles.music};`
            + `--ambientColor: ${GlobalStyles.ambient};`
            + `--sfxColor: ${GlobalStyles.sfx};`;
</script>

<div id="sound-list-view" style="{style}">
    <div id="app" class="custom-scroll">
        <div class="first-col">
            <div class="category music">
                <h2><i class="icon-font music-icon"></i>Music</h2>
                <div class="sound-box-container">
                    {#each $soundStore.music.sounds as sound}
                        <SoundBlock blockType="music" bind:soundData={sound} inputPrompt={inputPrompt}/>
                    {/each}
                    {#if $soundStore.music.sounds.length == 0}
                        <div class="empty-sound">No sound found in this category.</div>
                    {/if}
                </div>
            </div>
            <div class="category ambient">
                <h2><i class="icon-font ambient-icon"></i>Ambient</h2>
                <div class="sound-box-container">
                    {#each $soundStore.ambient.sounds as sound}
                        <SoundBlock blockType="ambient" bind:soundData={sound} inputPrompt={inputPrompt}/>
                    {/each}
                    {#if $soundStore.ambient.sounds.length == 0}
                        <div class="empty-sound">No sound found in this category.</div>
                    {/if}
                </div>
            </div>
        </div>
        <div class="second-col">
            <div class="category sfx">
                <h2><i class="icon-font sfx-icon"></i>Effects</h2>
                <div class="sound-box-container">
                    {#each $soundStore.sfx.sounds as sound}
                        <SoundBlock blockType="sfx" bind:soundData={sound} inputPrompt={inputPrompt}/>
                    {/each}
                    {#if $soundStore.sfx.sounds.length == 0}
                        <div class="empty-sound">No sound found in this category.</div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <InputPrompt bind:this={inputPrompt}/>
    <BottomBar/>
</div>


<style lang="scss">
    @import './fonts.scss';

    #sound-list-view {
        position: fixed;
        background-color: var(--bg, #333);
        top: var(--topBarHeight, 25);
        bottom: 0;
        width: 100%;
        overflow: hidden;

        #app {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 0 5px;
            bottom: 60px;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-color: dark;
        }

        .category {
            float: left;
            box-sizing: border-box;
            padding: 15px;
            padding-bottom: 40px;

            

            .empty-sound {
                width: 80%;
                margin: 20px auto;
                max-width: 250px;
                background-color: rgba(0, 0, 0, 0.18);
                color: #ddd;
                font-size: 13px;
                border-radius: 4px;
                padding: 5px;
                text-align: center;
            }

            h2 {
                width: 100%;
                margin-top: 10px;
                margin-bottom: 20px;
                text-align: center;
                user-select: none;
                font-size: 22px;

                .icon-font::before {
                    font-family: 'icomoon';
                    font-style: normal;
                    display: inline-block;
                    margin-right: 12px;
                    font-size: 26px;
                    transform: translateY(3px);
                }

                .music-icon::before {
                    content: '\e901';
                    color: var(--musicColor, #fff);
                }

                .ambient-icon::before {
                    content: '\e900';
                    color: var(--ambientColor, #fff);
                }

                .sfx-icon::before {
                    content: '\e902';
                    color: var(--sfxColor, #fff);
                }
            }
        }

        .first-col {
            float: left;
            width: 66.66%;

            @media (max-width: 950px) {
                width: 50%;
            }

            @media (max-width: 650px) {
                width: 100%;
            }

            .category {
                width: 50%;
                
                @media (max-width: 950px) {
                    width: 100%;
                }
            }
        }   

        .second-col {
            float: left;
            width: 33.33%;
            
            @media (max-width: 950px) {
                width: 50%;
            }

            @media (max-width: 650px) {
                width: 100%;
            }

            .category {
                width: 100%;
            }
        }
    }
</style>