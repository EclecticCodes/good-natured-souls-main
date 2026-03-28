"use client";
import { useEffect, useRef } from "react";

type Props = {
  type: string;
  name: string;
  artist: string;
  coverImage?: string;
};

export default function ProductDisplay3D({ type, name, artist, coverImage }: Props) {
  const id = Math.random().toString(36).slice(2, 8);

  if (type === 'vinyl') {
    return <VinylDisplay id={id} name={name} artist={artist} coverImage={coverImage} />;
  }
  if (type === 'digital') {
    return <DigitalDisplay id={id} name={name} artist={artist} coverImage={coverImage} />;
  }
  // cd or any physical — CD jewel case
  return <BoxDisplay id={id} name={name} artist={artist} coverImage={coverImage} />;
}

function BoxDisplay({ id, name, artist, coverImage }: { id: string; name: string; artist: string; coverImage?: string }) {
  const rigRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rigRef.current; if (!el) return;
    let rx=12,ry=-18,rz=0,vx=0,vy=0,spinAngle=0,spinSpeed=0;
    let isHovering=false,isPlaying=false,floatT=0,lastTs=0,rafId=0,eIX=0,eIY=0;
    const parent = el.parentElement!;
    function apply(){ el.style.transform=`rotateX(${rx}deg) rotateY(${ry+spinAngle}deg) rotateZ(${rz}deg)`; }
    function tick(ts:number){
      const dt=Math.min((ts-lastTs)/1000,0.05); lastTs=ts; floatT+=dt*0.7;
      if(isPlaying){ rx+=(0-rx)*dt*4; rz+=(0-rz)*dt*4; spinSpeed+=(320-spinSpeed)*dt*4; }
      else if(isHovering){ vx+=(eIX*60-vx)*dt*5; vy+=(eIY*80-vy)*dt*5; rx+=vx*dt; rz+=0; spinSpeed+=(30-spinSpeed)*dt*3; }
      else { rx+=(12+Math.sin(floatT)*2-rx)*dt*3; ry+=(-18+Math.sin(floatT*0.6)*4-ry)*dt*3; spinSpeed*=Math.pow(0.08,dt); }
      spinAngle+=spinSpeed*dt; apply(); rafId=requestAnimationFrame(tick);
    }
    function onEnter(e:MouseEvent){ if(isPlaying)return; const r=parent.getBoundingClientRect(); const nx=(e.clientX-r.left-r.width/2)/(r.width/2),ny=(e.clientY-r.top-r.height/2)/(r.height/2); if(Math.abs(nx)>Math.abs(ny)){eIX=ny*0.5;eIY=nx>0?-1:1;}else{eIX=ny>0?1:-1;eIY=nx*0.5;} isHovering=true; }
    function onMove(e:MouseEvent){ if(!isHovering||isPlaying)return; const r=parent.getBoundingClientRect(); eIX=(e.clientY-r.top-r.height/2)/(r.height/2)*0.6; eIY=-(e.clientX-r.left-r.width/2)/(r.width/2); }
    function onLeave(){ isHovering=false; }
    function onClick(){ isPlaying=!isPlaying; if(!isPlaying) spinSpeed*=0.05; }
    parent.addEventListener('mouseenter',onEnter); parent.addEventListener('mousemove',onMove); parent.addEventListener('mouseleave',onLeave); parent.addEventListener('click',onClick);
    lastTs=performance.now(); rafId=requestAnimationFrame(tick);
    return ()=>{ cancelAnimationFrame(rafId); parent.removeEventListener('mouseenter',onEnter); parent.removeEventListener('mousemove',onMove); parent.removeEventListener('mouseleave',onLeave); parent.removeEventListener('click',onClick); };
  },[]);

  return (
    <div style={{width:'100%',height:'100%',perspective:'900px',position:'relative'}}>
      <div ref={rigRef} style={{width:'100%',height:'100%',position:'absolute',transformStyle:'preserve-3d',willChange:'transform'}}>
        {/* Back art */}
        <div style={{position:'absolute',width:'calc(100% - 20px)',height:'calc(100% - 20px)',top:10,left:10,background:'conic-gradient(#F0B51E 0deg,#c8940a 45deg,#F0B51E 90deg,#e8a800 135deg,#F0B51E 180deg,#b07800 225deg,#F0B51E 270deg,#d4a000 315deg,#F0B51E 360deg)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:4,transform:'translateZ(-8px)',backfaceVisibility:'hidden'}}>
          <p style={{fontSize:9,letterSpacing:2,color:'#000',fontWeight:700,textAlign:'center',padding:'0 12px',lineHeight:1.4,margin:0}}>{name}</p>
          <p style={{fontSize:7,letterSpacing:1,color:'rgba(0,0,0,0.6)',margin:0}}>{artist}</p>
        </div>
        <div style={{position:'absolute',inset:0,background:'#111',border:'1px solid rgba(255,255,255,0.06)',transform:'translateZ(-8px)',backfaceVisibility:'hidden'}}/>
        <div style={{position:'absolute',width:'100%',height:16,top:0,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',transformOrigin:'top center',transform:'rotateX(90deg)',backfaceVisibility:'hidden'}}/>
        <div style={{position:'absolute',width:'100%',height:16,bottom:0,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',transformOrigin:'bottom center',transform:'rotateX(-90deg)',backfaceVisibility:'hidden'}}/>
        <div style={{position:'absolute',width:16,height:'100%',left:0,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',transformOrigin:'left center',transform:'rotateY(-90deg)',backfaceVisibility:'hidden'}}/>
        <div style={{position:'absolute',width:16,height:'100%',right:0,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',transformOrigin:'right center',transform:'rotateY(90deg)',backfaceVisibility:'hidden'}}/>
        {/* Front face — cover image or fallback gold */}
        <div style={{position:'absolute',inset:0,transform:'translateZ(8px)',backfaceVisibility:'hidden',overflow:'hidden',background:'#111',border:'1px solid rgba(255,255,255,0.14)'}}>
          {coverImage
            ? <img src={coverImage} alt={name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
            : <div style={{width:'100%',height:'100%',background:'conic-gradient(#F0B51E 0deg,#c8940a 90deg,#F0B51E 180deg,#b07800 270deg,#F0B51E 360deg)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:4}}>
                <p style={{fontSize:9,letterSpacing:2,color:'#000',fontWeight:700,textAlign:'center',padding:'0 8px',margin:0}}>{name}</p>
                <p style={{fontSize:7,letterSpacing:1,color:'rgba(0,0,0,0.6)',margin:0}}>{artist}</p>
              </div>
          }
        </div>
        {/* Glare overlay */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 50%)',transform:'translateZ(9px)',pointerEvents:'none'}}/>
        {/* Spine text on left side */}
        <div style={{position:'absolute',width:16,height:'100%',left:0,background:'rgba(10,10,10,0.9)',border:'1px solid rgba(255,255,255,0.08)',transformOrigin:'left center',transform:'rotateY(-90deg)',backfaceVisibility:'hidden',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
          <p style={{fontSize:6,letterSpacing:2,color:'#F0B51E',fontWeight:700,whiteSpace:'nowrap',transform:'rotate(-90deg)',margin:0}}>{name.slice(0,18)}</p>
        </div>
      </div>
    </div>
  );
}

function VinylDisplay({ id, name, artist, coverImage }: { id: string; name: string; artist: string; coverImage?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    let rx=20,ry=25,rz=0,vx=0,vy=0,vz=0,floatT=0,precPhase=0,lastTs=0,rafId=0,eIX=0,eIY=0,eIZ=0;
    let mode='float',clickCount=0,clickTimer=0;
    const parent=el.parentElement!;
    const PLAY=240,TIRE=320,RADIAL=380,HOVER=90;
    function apply(){ el.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`; }
    function tick(ts:number){
      const dt=Math.min((ts-lastTs)/1000,0.05); lastTs=ts; floatT+=dt*0.7; precPhase+=dt*2.8;
      if(mode==='tire'){ rx+=(8-rx)*dt*4; rz+=(0-rz)*dt*4; vy+=(TIRE-vy)*dt*4; ry+=vy*dt; }
      else if(mode==='play'){ rx+=(0-rx)*dt*6; rz+=(0-rz)*dt*6; vy+=(PLAY-vy)*dt*4; ry+=vy*dt; rx+=vx*dt; rz+=vz*dt; }
      else if(mode==='radial'){ const w=Math.sin(precPhase)*14,t=75+Math.abs(Math.cos(precPhase*0.3))*10; rx+=(t-rx)*dt*5; rz+=(w-rz)*dt*4; vy+=(RADIAL-vy)*dt*3; ry+=vy*dt; }
      else if(mode==='hover'){ vx+=(eIX*HOVER-vx)*dt*5; vy+=(eIY*HOVER-vy)*dt*5; vz+=(eIZ*HOVER*0.4-vz)*dt*5; rx+=vx*dt; ry+=vy*dt; rz+=vz*dt; }
      else { rx+=(20+Math.sin(floatT)*3-rx)*dt*3.5; ry+=(25+Math.sin(floatT*0.6)*5-ry)*dt*3.5; rz+=(Math.sin(floatT*0.4)*1.5-rz)*dt*3.5; vx*=Math.pow(0.05,dt); vy*=Math.pow(0.05,dt); vz*=Math.pow(0.05,dt); }
      apply(); rafId=requestAnimationFrame(tick);
    }
    function onEnter(e:MouseEvent){ if(['play','tire','radial'].includes(mode))return; const r=parent.getBoundingClientRect(); const nx=(e.clientX-r.left-r.width/2)/(r.width/2),ny=(e.clientY-r.top-r.height/2)/(r.height/2); if(Math.abs(nx)>Math.abs(ny)){eIX=ny*0.5;eIY=nx>0?-1:1;eIZ=nx*0.3;}else{eIX=ny>0?1:-1;eIY=nx*0.5;eIZ=ny*-0.3;} mode='hover'; }
    function onMove(e:MouseEvent){ if(mode!=='hover')return; const r=parent.getBoundingClientRect(); const nx=(e.clientX-r.left-r.width/2)/(r.width/2),ny=(e.clientY-r.top-r.height/2)/(r.height/2); eIX=ny*0.7;eIY=-nx;eIZ=nx*ny*0.3; }
    function onLeave(){ if(mode==='hover') mode='float'; }
    function onClick(){ clickCount++; clearTimeout(clickTimer); clickTimer=setTimeout(()=>{ const c=clickCount; clickCount=0; const stop=()=>{ mode='float'; }; if(c===1){ mode=mode==='play'?'float':'play'; vy=vy*0.2+PLAY*0.3; vx*=0.1; vz*=0.1; } else if(c===2){ mode=mode==='tire'?'float':'tire'; vy=vy*0.2+TIRE*0.3; } else if(c>=3){ mode=mode==='radial'?'float':'radial'; precPhase=0; vy=vy*0.2+RADIAL*0.3; } },250) as any; }
    parent.addEventListener('mouseenter',onEnter); parent.addEventListener('mousemove',onMove); parent.addEventListener('mouseleave',onLeave); parent.addEventListener('click',onClick);
    lastTs=performance.now(); rafId=requestAnimationFrame(tick);
    return ()=>{ cancelAnimationFrame(rafId); parent.removeEventListener('mouseenter',onEnter); parent.removeEventListener('mousemove',onMove); parent.removeEventListener('mouseleave',onLeave); parent.removeEventListener('click',onClick); };
  },[]);

  const W=120,H=120,R=W/2;
  const labelCanvasRef = useRef<HTMLCanvasElement>(null);
  const grooveAngles=[0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345];
  const colors=['#181818','#222','#111','#1c1c1c','#111','#222','#181818','#111','#222','#111','#181818','#222','#111','#1c1c1c','#111','#222','#181818','#111','#222','#111','#181818','#222','#111','#181818'];

  useEffect(() => {
    if (!coverImage || !labelCanvasRef.current) return;
    const canvas = labelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, 64, 64);
      ctx.save();
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, 64, 64);
      ctx.restore();
      // Center hole
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(32, 32, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    img.src = coverImage;
  }, [coverImage]);

  return (
    <div style={{width:'100%',height:'100%',perspective:'700px',position:'relative'}}>
      <div ref={wrapRef} style={{width:'100%',height:'100%',position:'absolute',transformStyle:'preserve-3d',willChange:'transform'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',overflow:'hidden',backfaceVisibility:'hidden'}}>
          <svg width="100%" height="100%" viewBox="0 0 120 120">
            {grooveAngles.map((angle,i)=>{
              const a1=angle*Math.PI/180, a2=(angle+15)*Math.PI/180;
              const x1=60+R*Math.cos(a1),y1=60+R*Math.sin(a1),x2=60+R*Math.cos(a2),y2=60+R*Math.sin(a2);
              return <path key={i} d={`M 60 60 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={colors[i]} />;
            })}
            {!coverImage && <circle cx="60" cy="60" r="32" fill="#F0B51E"/>}
            {!coverImage && <text x="60" y="57" textAnchor="middle" fontSize="7" fontWeight="bold" letterSpacing="2" fill="#000">GNS</text>}
            {coverImage && <foreignObject x="28" y="28" width="64" height="64">
              <canvas ref={labelCanvasRef} width={64} height={64} style={{width:64,height:64,borderRadius:'50%'}} />
            </foreignObject>}
            <circle cx="60" cy="60" r="4" fill="#000"/>
            <circle cx="60" cy="60" r="26" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            <circle cx="60" cy="60" r="20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            <path d="M 60 60 L 110 60 A 50 50 0 0 0 60 10 Z" fill="rgba(255,255,255,0.06)"/>
          </svg>
        </div>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'#1a1a1a',transform:'rotateY(180deg)',backfaceVisibility:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:'#F0B51E',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2,color:'#000'}}>GNS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DigitalDisplay({ id, name, artist, coverImage }: { id: string; name: string; artist: string; coverImage?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W=canvas.width,H=canvas.height,PS=Math.floor(W/25);
    const GOLD='#F0B51E',DGRAY='#1a1a1a',LGRAY='#2a2a2a';
    const bx=Math.floor(W*0.22),by=Math.floor(H*0.11),bw=Math.floor(W*0.56),bh=Math.floor(H*0.68);
    const cx=Math.floor(W*0.33),cy=Math.floor(H*0.79),cw=Math.floor(W*0.34),ch=Math.floor(H*0.14);
    const lx=Math.floor(W*0.41),ly=Math.floor(H*0.19),lw=Math.floor(W*0.18),lh=Math.floor(H*0.06);
    let fragments:any[]=[],state='assembling',frame=0,glowPhase=0,mouseX=W/2,mouseY=H/2,isHovering=false;
    function build(){ fragments=[]; for(let x=bx;x<bx+bw;x+=PS){ for(let y=by;y<by+bh;y+=PS){ const isLed=x>=lx&&x<lx+lw&&y>=ly&&y<ly+lh; const isConn=x>=cx&&x<cx+cw&&y>=cy&&y<cy+ch; const color=isLed?GOLD:isConn?LGRAY:(Math.random()>0.3?DGRAY:LGRAY); fragments.push({tx:x,ty:y,x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,color,alpha:0,delay:Math.random()*40,fp:Math.random()*Math.PI*2,fs:0.4+Math.random()*0.6,rebel:Math.random()<0.3}); } } }
    // Load cover image if provided
    let coverImg: HTMLImageElement | null = null;
    let coverLoaded = false;
    if (coverImage) {
      coverImg = new Image();
      coverImg.crossOrigin = 'anonymous';
      coverImg.onload = () => {
        coverLoaded = true;
        // Force reassemble so drawUSB picks up the loaded image
        if (state === 'assembled') {
          state = 'reassembling';
          for (const f of fragments) {
            f.x = f.tx + (Math.random() - 0.5) * 4;
            f.y = f.ty + (Math.random() - 0.5) * 4;
            f.alpha = 0.8;
          }
        }
      };
      coverImg.src = coverImage;
    }

    function drawUSB(){
      if (coverLoaded && coverImg) {
        // Draw cover image mapped onto USB body area
        ctx.save();
        ctx.drawImage(coverImg, bx, by, bw, bh);
        // Overlay dark tint so USB details are visible
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.restore();
        // Border
        ctx.strokeStyle = LGRAY; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
      } else {
        ctx.fillStyle=DGRAY; ctx.fillRect(bx,by,bw,bh);
        ctx.strokeStyle=LGRAY; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,bh);
      }
      // Connector always drawn
      ctx.fillStyle=LGRAY; ctx.fillRect(cx,cy,cw,ch);
      ctx.strokeStyle='#3a3a3a'; ctx.strokeRect(cx,cy,cw,ch);
      ctx.fillStyle='#444'; ctx.fillRect(cx+3,cy+3,cw-6,ch-6);
      // LED glow
      ctx.save(); ctx.globalAlpha=0.6+Math.sin(glowPhase)*0.4; ctx.fillStyle=GOLD; ctx.fillRect(lx,ly,lw,lh); ctx.restore();
      // Text
      ctx.save(); ctx.globalAlpha=0.85; ctx.fillStyle=GOLD; ctx.font=`bold ${Math.floor(W*0.065)}px Helvetica Neue`; ctx.textAlign='center'; ctx.fillText('GNS',W/2,H*0.56); ctx.restore();
      ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='#fff'; ctx.font=`${Math.floor(W*0.045)}px Helvetica Neue`; ctx.textAlign='center'; ctx.fillText(name.slice(0,12),W/2,H*0.65); ctx.restore();
    }
    let rafId:number;
    function tick(){ ctx.clearRect(0,0,W,H);glowPhase+=0.06;frame++;
      if(state==='assembled'){drawUSB();}
      else if(state==='assembling'||state==='reassembling'){ let done=true; for(const f of fragments){ if(state==='assembling'&&frame<f.delay){done=false;continue;} const dx=f.tx-f.x,dy=f.ty-f.y,dist=Math.sqrt(dx*dx+dy*dy); if(dist>0.8){done=false;f.x+=dx*0.11;f.y+=dy*0.11;f.vx*=0.8;f.vy*=0.8;}else{f.x=f.tx;f.y=f.ty;} f.alpha=Math.min(1,f.alpha+0.05);ctx.save();ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.fillRect(f.x,f.y,PS-1,PS-1);ctx.restore(); } if(done)state='assembled'; }
      else if(state==='scattered'){ for(const f of fragments){ f.fp+=0.012*f.fs; if(!f.rebel&&isHovering){const dx=mouseX-f.x,dy=mouseY-f.y,dist=Math.sqrt(dx*dx+dy*dy)||1;if(dist>20){f.vx+=dx/dist*0.5;f.vy+=dy/dist*0.5;}else{f.vx+=(-dy/dist)*0.4;f.vy+=(dx/dist)*0.4;}}else{f.vx+=Math.sin(f.fp)*0.08;f.vy+=Math.cos(f.fp*0.7)*0.08;f.vx+=0.008*(f.tx>W/2?1:-1);f.vy-=0.004;} f.vx*=0.95;f.vy*=0.95;f.x+=f.vx;f.y+=f.vy; if(f.rebel){if(f.x<0||f.x>W||f.y<0||f.y>H)f.alpha=Math.max(0,f.alpha-0.02);else f.alpha=Math.min(1,f.alpha+0.01);} ctx.save();ctx.globalAlpha=f.alpha*0.9;ctx.fillStyle=f.color;ctx.fillRect(f.x,f.y,PS-1,PS-1);ctx.restore(); } }
      rafId=requestAnimationFrame(tick);
    }
    const parent=canvas.parentElement!;
    function onEnter(){isHovering=true;}
    function onLeave(){isHovering=false;}
    function onMove(e:MouseEvent){const r=canvas.getBoundingClientRect();mouseX=e.clientX-r.left;mouseY=e.clientY-r.top;}
    function onClick(){ if(state==='assembled'){state='scattered';for(const f of fragments){const dx=f.tx-W/2,dy=f.ty-H/2,d=Math.sqrt(dx*dx+dy*dy)||1;const s=f.rebel?3+Math.random()*5:1.5+Math.random()*2.5;f.vx=(dx/d)*s+(Math.random()-0.5)*2;f.vy=(dy/d)*s+(Math.random()-0.5)*2;f.alpha=1;}}else if(state==='scattered'){state='reassembling';for(const f of fragments){if(f.x<0)f.x=2;if(f.x>W)f.x=W-2;if(f.y<0)f.y=2;if(f.y>H)f.y=H-2;f.alpha=Math.max(0.1,f.alpha);}}}
    parent.addEventListener('mouseenter',onEnter);parent.addEventListener('mouseleave',onLeave);parent.addEventListener('mousemove',onMove);parent.addEventListener('click',onClick);
    build(); rafId=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(rafId);parent.removeEventListener('mouseenter',onEnter);parent.removeEventListener('mouseleave',onLeave);parent.removeEventListener('mousemove',onMove);parent.removeEventListener('click',onClick);};
  },[name, coverImage]);

  return <canvas ref={canvasRef} width={300} height={300} style={{width:'100%',height:'100%',display:'block'}} />;
}
