const NOTE=sprite(["...#..","...##.","...#.#","...#..",".###..","####..",".##..."],{'#':'#ffffff'},OUTC);
const NOTEC=['#ffe03a','#ff7ad8','#5fe0ff','#7dff8a'];
const NOTES=NOTEC.map(c=>sprite(["...#..","...##.","...#.#","...#..",".###..","####..",".##..."],{'#':c},OUTC));
const LOCKC=sprite([".###.","#...#","#...#","OOOOO","OOkOO","OOkOO","OOOOO"],{'#':'#c8c8dc',O:'#ffc83a',k:'#6a4010'},OUTC);
const LOCKO=sprite([".###.","#...#","#...#","#....","OOOOO","OOkOO","OOkOO","OOOOO"],{'#':'#c8c8dc',O:'#ffc83a',k:'#6a4010'},OUTC);
const SPARK=sprite(["..#..","..#..","##.##","..#..","..#.."],{'#':'#fff6c0'});
const CHECK=sprite(["....#","...##","#.##.","###..",".#..."],{'#':'#5ae06a'});
const STORM=sprite(["..####.....",".######.##.","###########",".#########.","....y......","...yy......","....y......","...y......."],{'#':'#8a8aaa',y:'#ffe03a'});
const MONK=[
".....#####............",
"....#.....#...........",
"..###.#.#.###.........",
"..#.#.....#.#.........",
"..###.###.###.........",
"....#.....#...........",
".....#####............",
"....#.....#......###..",
"...#.......#....#...#.",
"...#.......#....#...#.",
"...#.......#.....#..#.",
"...#.......#........#.",
"....#.....#........#..",
"...##.....##......#...",
"..#..#####..#....#....",
"..#.........#####.....",
"...#########.........."];
function neon(rows,tube,halo,hi){
  const w=Math.max(...rows.map(r=>r.length)),h=rows.length,c=mk(w+2,h+2),g=c.getContext('2d');
  const on=(x,y)=>y>=0&&y<h&&x>=0&&x<w&&rows[y][x]==='#';
  if(halo){g.fillStyle=halo;for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(on(x,y))continue;for(const[dx,dy]of OUT8)if(on(x+dx,y+dy)){g.fillRect(x+1,y+1,1,1);break;}}}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(on(x,y)){g.fillStyle=(hi&&((x+y)%5===0))?hi:tube;g.fillRect(x+1,y+1,1,1);}
  return c;
}
function textRows(s){const rows=Array.from({length:7},()=>'');for(const ch of s){const g=gl(ch);for(let r=0;r<7;r++)rows[r]+=g[r]+'.';}return rows;}
const NEON={mOn:neon(MONK,'#ff5fd8','#5c1a50','#ffc6f2'),mOff:neon(MONK,'#46163f',null),bOn:neon(textRows('BAR'),'#5fe8ff','#123e58','#d0f8ff'),bOff:neon(textRows('BAR'),'#16323e',null)};

