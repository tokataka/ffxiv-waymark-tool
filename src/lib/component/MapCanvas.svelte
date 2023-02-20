<script lang="ts">
  import { WaymarkId, type WaymarkPreset } from '$lib/model/WaymarkPreset';
  import { onMount } from 'svelte';
  import { MAP_BASE_URL, MARKER_BASE_URL } from '$lib/constants';
  import { mapData, mapImage } from '$lib/store';
  import axios from 'axios';

  export let waymarkPreset: WaymarkPreset;
  export let subMapId: number;
  export let width: number;
  export let height: number;

  let mapId: number;

  let mounted = false;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  let currentMapImage: ImageBitmap;
  const markerImages: ImageBitmap[] = [];

  const MAP_SIZE = 2048;
  const MARKER_SIZE = 192;

  let zoomFactor = 1;
  let zoom = 1;
  let panX = 0;
  let panY = 0;

  let isMouseDown = false;

  onMount(async () => {
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    for (let i = 0; i < 8; i++) {
      const markerUrl = `${MARKER_BASE_URL}/${WaymarkId[i]}.png`;
      const res = await axios.get<Blob>(markerUrl, { responseType: 'blob' });
      markerImages.push(await createImageBitmap(res.data));
    }

    mounted = true;
  });

  const drawCanvas = () => {
    if (!currentMapImage) return;

    const { offsetX, offsetY, sizeFactor } = $mapData[mapId].subMaps[subMapId];

    ctx?.clearRect(
      -width / 2 / zoom - panX,
      -height / 2 / zoom - panY,
      width / zoom,
      height / zoom
    );
    ctx?.drawImage(currentMapImage, -(MAP_SIZE / 2), -(MAP_SIZE / 2));

    const markerSize = ((MARKER_SIZE / 2) * 100) / sizeFactor;

    for (let i = 0; i < 8; i++) {
      const waymark = waymarkPreset.waymarks[i];

      if (waymark.active) {
        const x = ((offsetX + waymark.x) * sizeFactor) / 100 - markerSize / 2;
        const z = ((offsetY + waymark.z) * sizeFactor) / 100 - markerSize / 2;
        ctx?.drawImage(markerImages[i], x, z, markerSize, markerSize);
      }
    }
  };

  $: {
    if (mapId === waymarkPreset.mapId) {
      drawCanvas();
    } else {
      mapId = waymarkPreset.mapId;
    }
  }

  $: {
    if (mounted) {
      try {
        const mapFile = $mapData[mapId].mapFile;
        const mapFileIndex = $mapData[mapId].subMaps[subMapId].mapFileIndex;
        const mapFileKey = `${mapFile}.${mapFileIndex}`;

        if (!(mapFileKey in $mapImage)) {
          const mapFileUrl = `${MAP_BASE_URL}/${mapFileKey}.png`;

          axios.get<Blob>(mapFileUrl, { responseType: 'blob' }).then((res) => {
            createImageBitmap(res.data).then((image) => {
              $mapImage[mapFileKey] = image;
              currentMapImage = $mapImage[mapFileKey];

              resetAndDrawCanvas();
            });
          });
        } else {
          currentMapImage = $mapImage[mapFileKey];

          resetAndDrawCanvas();
        }
      } catch (error) {
        // console.log(mapId);
        // console.log(error);
      }
    }
  }

  const resetAndDrawCanvas = () => {
    const { sizeFactor } = $mapData[mapId].subMaps[subMapId];
    if (sizeFactor === 400) {
      zoomFactor = 6;
    } else {
      zoomFactor = 1;
    }

    ctx?.resetTransform();

    const widthOrHeight = Math.min(width, height);

    const baseZoom = (zoomFactor * widthOrHeight) / MAP_SIZE;

    ctx?.scale(baseZoom, baseZoom);
    ctx?.translate(width / 2 / baseZoom, height / 2 / baseZoom);

    panX = 0;
    panY = 0;
    zoom = baseZoom;

    drawCanvas();
  };

  const mousewheel = (ev: WheelEvent) => {
    const prevZoom = zoom;
    if (ev.deltaY != 0) {
      if (ev.deltaY < 0) {
        zoom = zoom * 1.1;
      } else {
        zoom = zoom / 1.1;
      }
      ctx?.translate(-width / 2 / prevZoom - panX, -height / 2 / prevZoom - panY);
      ctx?.scale(zoom / prevZoom, zoom / prevZoom);
      ctx?.translate(width / 2 / zoom + panX, height / 2 / zoom + panY);

      drawCanvas();
    }
  };

  const mousedown = (ev: MouseEvent) => {
    if (ev.button === 0) {
      isMouseDown = true;
    }
  };

  const mouseup = (ev: MouseEvent) => {
    if (ev.button === 0) {
      isMouseDown = false;
    }
  };

  const mousemove = (ev: MouseEvent) => {
    if (isMouseDown) {
      ctx?.translate(ev.movementX / zoom, ev.movementY / zoom);
      panX += ev.movementX / zoom;
      panY += ev.movementY / zoom;

      drawCanvas();
    }
  };
</script>

<canvas
  bind:this={canvas}
  on:wheel|preventDefault={mousewheel}
  on:mousedown={mousedown}
  on:mouseup={mouseup}
  on:mousemove={mousemove}
/>
