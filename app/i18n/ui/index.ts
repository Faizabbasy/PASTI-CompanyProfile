import common from './common'
import layout from './layout'
import home from './home'
import about from './about'
import creative from './creative'
import technology from './technology'
import work from './work'
import insights from './insights'
import contact from './contact'
import open from './open'
import shiftly from './shiftly'
import ecorp from './ecorp'
import fast from './fast'
import dora from './dora'
import matrix from './matrix'

// All Indonesian UI dictionaries merged (one file per site area, so they can
// be edited independently). Later areas win on a duplicate key.
export const UI_ID: Record<string, string> = Object.assign({}, common, layout, home, about, creative, technology, work, insights, contact, open, shiftly, ecorp, fast, dora, matrix)
