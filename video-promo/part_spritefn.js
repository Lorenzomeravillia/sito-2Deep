function sprite(rows,map,outline){
  const w=Math.max(...rows.map(r=>r.length)),h=rows.length,o=outline?1:0;
  const c=mk(w+o*2,h+o*2),g=c.getContext('2d');
  const solid=(x,y)=>y>=0&&y<h&&x>=0&&x<rows[y].length&&rows[y][x]!=='.'&&map[rows[y][x]];
  if(outline){g.fillStyle=outline;for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){if(solid(x,y))continue;if(solid(x-1,y)||solid(x+1,y)||solid(x,y-1)||solid(x,y+1))g.fillRect(x+o,y+o,1,1);}}
  for(let y=0;y<h;y++)for(let x=0;x<rows[y].length;x++){const k=rows[y][x];if(k!=='.'&&map[k]){g.fillStyle=map[k];g.fillRect(x+o,y+o,1,1);}}
  return c;
}
