export const VERTEX_SHADER = `
  attribute vec2 a;
  varying vec2 v;
  void main() {
    v = a * 0.5 + 0.5;
    gl_Position = vec4(a, 0.0, 1.0);
  }
`

export const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uP;
uniform float uT;
uniform float uAR;
uniform float uMode;
uniform float uImgAR;

// Fit uB's image into the canvas like CSS background-size:cover — crops instead of stretching
vec2 coverUV(vec2 uv, float canvasAR, float imgAR){
  vec2 ratio = vec2(min(canvasAR/imgAR,1.0), min(imgAR/canvasAR,1.0));
  return vec2(uv.x*ratio.x+(1.0-ratio.x)*0.5, uv.y*ratio.y+(1.0-ratio.y)*0.5);
}

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float hash3(vec2 p){ return fract(sin(dot(p,vec2(269.5,183.3)))*85734.3); }
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float noise2(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash3(i),hash3(i+vec2(1,0)),u.x),mix(hash3(i+vec2(0,1)),hash3(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<7;i++){v+=a*noise(p);p*=2.03;a*=.5;} return v; }
float fbm2(vec2 p){ float v=0.,a=.5; for(int i=0;i<7;i++){v+=a*noise2(p);p*=1.97;a*=.52;} return v; }
float warpedFbm(vec2 p){
  vec2 q=vec2(fbm(p),fbm(p+vec2(5.2,1.3)));
  vec2 r=vec2(fbm(p+4.0*q+vec2(1.7,9.2)),fbm(p+4.0*q+vec2(8.3,2.8)));
  return fbm(p+4.0*r);
}

/* SECTION: organic chaotic dissolve from centre */
vec4 sectionDissolve(){
  vec2 uv=v;
  vec2 asp=vec2(uAR,1.);
  vec2 d=(uv-vec2(.5))*asp;
  float dist=length(d);
  float maxR=length(vec2(.5)*asp);
  float normDist=dist/maxR;
  float wf=warpedFbm(uv*1.6+vec2(2.1,0.8));
  float mf=fbm2(uv*3.4+vec2(1.3,4.7));
  float ff=fbm(uv*8.5+vec2(3.3,1.1));
  float ff2=fbm2(uv*13.0+vec2(5.7,2.9));
  float combined=wf*0.42+mf*0.28+ff*0.18+ff2*0.12;
  float noiseOffset=(combined-0.5)*1.10;
  float ang=atan(d.y,d.x);
  float angularNoise=fbm(vec2(cos(ang)*1.4,sin(ang)*1.4)+vec2(0.1))*0.28;
  float angularNoise2=fbm2(vec2(cos(ang*2.3)*1.8,sin(ang*2.3)*1.8))*0.18;
  float threshold=normDist+noiseOffset+angularNoise-angularNoise2;
  float mixF=smoothstep(threshold+0.10,threshold-0.10,uP);
  vec4 col=mix(texture2D(uA,uv),texture2D(uB,coverUV(uv,uAR,uImgAR)),mixF);
  // Faint white glow along the dissolve boundary — keeps the noise edge readable
  // against an otherwise dark-on-dark crossfade.
  float edge=1.0-abs(mixF*2.0-1.0);
  col.rgb+=vec3(1.0)*edge*edge*0.16;
  return col;
}

/* PAGE: glass lens morph */
vec4 glassLens(){
  vec2 uv=v;
  vec2 asp=vec2(uAR,1.);
  vec2 center=vec2(.5);
  vec2 d=(uv-center)*asp;
  float dist=length(d);
  float maxR=length(vec2(.5)*asp)*1.18;
  float r=uP*maxR;
  float ang=atan(d.y,d.x);
  float wobAmt=0.026*(1.-pow(abs(uP*2.-1.),3.));
  float wob=fbm(vec2(cos(ang)*2.3+uT*0.42,sin(ang)*2.3+uT*0.36))*wobAmt;
  float rW=r+wob;
  float edgeW=0.052+0.022*sin(uT*1.15);
  float mask=smoothstep(rW+edgeW,rW-edgeW,dist);
  vec2 uvB=uv;
  float inside=smoothstep(rW+edgeW,rW,dist);
  if(inside>0.){
    vec2 toC=normalize(center-uv);
    float depth=sqrt(max(0.,1.-pow(dist/max(rW+edgeW,.001),2.)));
    float refStr=0.022*inside*depth*(1.-abs(uP*2.-1.));
    float n1=fbm(uv*5.8-uT*0.23)*2.-1.;
    float n2=fbm(uv*5.8+uT*0.19+vec2(3.7,1.9))*2.-1.;
    uvB=uv+vec2(n1,n2)*refStr*.32+toC*refStr;
  }
  vec4 colA=texture2D(uA,uv);
  vec4 colB=texture2D(uB,clamp(uvB,0.,1.));
  vec4 col=mix(colA,colB,mask);
  float rimO=smoothstep(rW+edgeW,rW+edgeW*.08,dist);
  float rimI=smoothstep(rW-edgeW*.45,rW,dist);
  float rim=rimO*rimI;
  vec2 lDir=normalize(vec2(-.65,-.72));
  float shine=dot(normalize(d+.0001),lDir)*.5+.5;
  col.rgb+=vec3(.93,.96,1.)*pow(shine,3.)*rim*1.1;
  col.rgb+=vec3(.55,.65,.82)*rim*.28;
  float shad=smoothstep(rW+edgeW*1.9,rW+edgeW,dist)*smoothstep(rW+edgeW,rW+edgeW*.35,dist);
  col.rgb-=vec3(.22)*shad;
  float fres=smoothstep(rW,rW-edgeW*.32,dist)*smoothstep(rW-edgeW,rW-edgeW*.62,dist);
  col.rgb+=vec3(.5,.62,.8)*fres*.18;
  return col;
}

void main(){
  gl_FragColor = uMode < 0.5 ? sectionDissolve() : glassLens();
}
`
