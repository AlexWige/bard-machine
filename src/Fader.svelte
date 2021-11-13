<script>
    const speed = 1;

    export let value;
    export let onEnd;

    let from = 0;
    let to = 1;
    let isActive = false;
    let tickInterval;

    export function start(toValue) {
        if(value == toValue) return;
        from = value;
        to = toValue;
        if (!isActive) {
            tickInterval = setInterval(tick, 30);
            isActive = true;
        }
    }

    export function pause() {
        if(isActive) {
            if(tickInterval) clearInterval(tickInterval);
            isActive = false;
        }
    }

    export function skip() {
        value = to;
        pause();
    }

    function tick() {
        if(to > from) {
            value += speed * 0.03;
            value = Math.min(value, to);
            if (value >= to) {
                pause();
                if(onEnd) onEnd();
            }
        } else {
            value -= speed * 0.03 * 1.5; // HIGHER SPEED ON FADE DOWN
            value = Math.max(value, to);
            if (value <= to) {
                pause();
                if(onEnd) onEnd();
            }
        }
    }
</script>