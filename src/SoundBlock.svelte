<script>
    import PlayButton from './PlayButton.svelte';
    import VolumeSlider from './VolumeSlider.svelte';
    import GlobalColors from './GlobalColors';
    import Color from 'color';
    
    export let blockType;
    export let title;

    export let isPlaying = false;

    $: mainColor = getMainColor(blockType);

    $: style = `--mainColor: ${mainColor.hex()};`
        + `--mainBoxBG: ${GlobalColors.bg.lighten(0.5).hex()};`
        + `--assignButtonBorder: ${GlobalColors.bg.lighten(1.65).hex()};`;

    function getMainColor(blockType) {
        switch (blockType) {
            case 'music': return GlobalColors.music;
            case 'ambient': return GlobalColors.ambient;
            case 'sfx': return GlobalColors.sfx;
            default: return Color('#333');
        }
    }
</script>

<div class="sound-block {blockType}" style="{style}">
    <div class="main-box">
        <div class="info-zone">
            <i class="category-icon"></i>
            <div class="info-bar">
                {title ?? ""}
            </div>
            <div class="volume">
                <VolumeSlider mainColor={mainColor} isActive={isPlaying}></VolumeSlider>
            </div>
        </div>       
        <div class="assign-btn"></div>         
    </div>
    <PlayButton mainColor={mainColor}/>
</div>

<style lang="scss">
    .sound-block {
        &.ambient {
            .main-box .info-zone .category-icon::before {
                content: '\e9a4';
            }
        }
        
        &.music {
            .main-box .info-zone .category-icon::before {
                content: '\e911';
            }
        }
        
        &.sfx {
            .main-box .info-zone .category-icon::before {
                content: '\e996';
            }
        }

        font-family: 'Poppins', sans-serif;
        position: relative;
        margin: 20px 0;
        height: 65px;
        width: 100%;
        font-weight: 400;

        &.active {
            font-weight: 600;
        }

        .main-box {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 40px;
            right: 0;
            user-select: none;
            transition: box-shadow 0.15s;
            background-color: var(--mainBoxBG, #333);

            &:hover {
                box-shadow: 0 0 10px transparentize(#000, 0.9);
            }

            .volume {
                position: absolute;
                bottom: 7px;
                width: 100%;
                height: 8px;
            }

            .assign-btn {
                position: absolute;
                height: 42px;
                width: 42px;
                right: 14px;
                top: 12px;
                box-sizing: border-box;
                border: 4px solid var(--assignButtonBorder, #555);
                border-radius: 8px;
                background-color: transparentize(#000, 0.8);
                color: white;
                text-align: center;
                padding: 5px;
                line-height: 26px;
                font-size: 25px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                justify-content: center;

                &:hover {
                    transition: 0.03s;
                    transform: scale(1.08);
                    background-color: transparentize(#000, 0.7);
                }

                &:active {
                    transition: transform 0.02s;
                    transform: scale(0.98);
                }
            }

            .info-zone {
                position: absolute;
                top: 8px;            
                left: 44px;
                bottom: 8px;
                right: 73px;

                .info-bar {
                    position: absolute;
                    top: 0;
                    left: 0px;
                    right: 0px;
                    height: 24px;
                    font-size: 15px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .category-icon {
                    &::before {
                        font-family: 'icomoon';
                        display:  none;
                        position: absolute;
                        left: 0;
                        top: 2px;
                        font-size: 18px;
                        font-style: normal;
                        font-weight: normal;
                    }
                }
            }
        }
    }
</style>