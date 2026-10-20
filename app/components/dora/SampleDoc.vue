<script setup lang="ts">
import type { DoraField } from '~/composables/useDora'

// The synthetic sample page (owner D3, docs/dora/00): an official letter
// from a fictitious "INSTANSI CONTOH" — no real institution, no NIK, no
// vehicle number, no address. Real text, not an image, so it stays sharp.
// The four extracted values carry field-location markers: `markers` shows
// the frames, `active` is the selected field, `flag` the one under review.
// The printed date ("12 Oktober 2026") differs from its extracted value
// (2026-10-12) on purpose — extraction normalises it.
type Key = DoraField['key']
withDefaults(defineProps<{ markers?: boolean; active?: Key | null; flag?: Key | null }>(), {
  markers: false,
  active: null,
  flag: null
})
</script>

<template>
  <div class="dsd-wrap">
  <div
    class="dsd relative bg-pureWhite text-[#1B1F23]"
    role="img"
    aria-label="Synthetic sample letter from a fictitious agency, with document number, subject, date and name marked as extracted fields."
  >
    <div aria-hidden="true">
      <div class="text-center">
        <p class="dsd-head">INSTANSI CONTOH</p>
        <p class="dsd-sub">UNIT KERJA CONTOH</p>
      </div>
      <div class="dsd-rule" />
      <table class="dsd-meta">
        <tbody>
          <tr><td>Nomor</td><td>:</td><td><span class="dsd-f" :class="{ 'is-on': markers, 'is-active': active === 'docNo', 'is-flag': flag === 'docNo' }">000.1/0001/CONTOH/X/2026</span></td></tr>
          <tr><td>Lampiran</td><td>:</td><td>1 (satu) berkas</td></tr>
          <tr><td>Perihal</td><td>:</td><td><span class="dsd-f" :class="{ 'is-on': markers, 'is-active': active === 'subject', 'is-flag': flag === 'subject' }">Permohonan Data Contoh</span></td></tr>
        </tbody>
      </table>
      <p class="dsd-right">Kota Contoh, <span class="dsd-f" :class="{ 'is-on': markers, 'is-active': active === 'date', 'is-flag': flag === 'date' }">12 Oktober 2026</span></p>
      <p class="dsd-p">Kepada Yth.<br>Penerima Contoh<br>di Tempat</p>
      <p class="dsd-p">Dengan hormat,</p>
      <span class="dsd-bar w-[92%]" /><span class="dsd-bar w-[86%]" /><span class="dsd-bar w-[58%]" />
      <p class="dsd-p dsd-indent">Nama&nbsp;&nbsp;: <span class="dsd-f" :class="{ 'is-on': markers, 'is-active': active === 'name', 'is-flag': flag === 'name' }">NAMA CONTOH</span></p>
      <span class="dsd-bar w-[90%]" /><span class="dsd-bar w-[44%]" />
      <div class="dsd-sign">
        <p>Hormat kami,</p>
        <span class="dsd-bar mt-[2.2em] w-full" />
        <span class="dsd-bar w-[70%]" />
      </div>
    </div>
    <span aria-hidden="true" class="absolute right-2.5 top-2.5 rounded bg-[#5b6470] px-1.5 py-0.5 font-mono text-[9px] text-pureWhite">1/1</span>
  </div>
  </div>
</template>

<style scoped>
/* The page scales with its column (container query), so it is recomposed,
   never cropped: text, padding and markers are all in em of this size. */
.dsd-wrap {
  container-type: inline-size;
}
.dsd {
  font-family: 'Times New Roman', Times, Georgia, serif;
  font-size: clamp(7.5px, 3.05cqw, 13px);
  line-height: 1.55;
  padding: 2.4em 2.6em 2.2em;
  aspect-ratio: 1 / 1.1;
  overflow: hidden;
}
.dsd-head {
  font-weight: 700;
  font-size: 1.25em;
  letter-spacing: 0.04em;
}
.dsd-sub {
  font-weight: 700;
  font-size: 1.05em;
  letter-spacing: 0.04em;
}
.dsd-rule {
  margin: 0.8em 0 1.2em;
  border-top: 2px solid #1b1f23;
  border-bottom: 1px solid #1b1f23;
  height: 3px;
}
.dsd-meta td {
  padding: 0.05em 0.4em 0.05em 0;
  vertical-align: top;
}
.dsd-right {
  margin: 0.9em 0;
  text-align: right;
}
.dsd-p {
  margin: 0.6em 0;
}
.dsd-indent {
  padding-left: 2.5em;
}
.dsd-bar {
  display: block;
  height: 0.5em;
  margin: 0.55em 0;
  border-radius: 2px;
  background: #e3e6ea;
}
.dsd-sign {
  width: 38%;
  margin: 1.2em 0 0 auto;
}
/* Field-location marker. Non-text strokes only (doraCyan-deep on paper). */
.dsd-f {
  position: relative;
  outline: 1.5px solid transparent;
  outline-offset: 1px;
  border-radius: 1px;
  transition: outline-color 0.35s var(--ease-css-primary), background-color 0.35s var(--ease-css-primary);
}
.dsd-f.is-on {
  outline-color: rgba(10, 127, 147, 0.75);
}
.dsd-f.is-active {
  outline: 2px solid #0a7f93;
  background: rgba(31, 214, 238, 0.18);
}
.dsd-f.is-flag {
  outline: 2px solid #c2412d;
  background: rgba(194, 65, 45, 0.1);
}
</style>
