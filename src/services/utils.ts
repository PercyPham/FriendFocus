export const findFeedPosts = () => {
  const mainDiv = document.querySelector('div[role="main"]');
  if (!mainDiv) return undefined;

  const h3s = mainDiv.querySelectorAll('h3');
  const feedPostsHeader = Array.from(h3s).find((h3) =>
    h3.textContent?.includes('Feed posts')
  );
  if (!feedPostsHeader) return undefined;

  const feedPostsWrapper = feedPostsHeader.parentElement;
  if (!feedPostsWrapper) return undefined;

  const feedPostsChildren = feedPostsWrapper.children;

  const feedPostsDiv = Array.from(feedPostsChildren).find((div) => {
    if (div.children.length < 2) return false;

    const hasAllDivsInside = Array.from(div.children).every(
      (nestedChild) => nestedChild.tagName === 'DIV'
    );
    return hasAllDivsInside;
  });
  if (!feedPostsDiv) return undefined;

  const feedPosts = Array.from(feedPostsDiv.children);
  return feedPosts;
};

export const isPeoplePost = (post: Element) => {
  // Every post will have 3 parts:
  // 1. Header: avatar, post owner info
  // 2. Content
  // 3. Actions: like, comment, share, etc

  // We focus on the People Posts (not page, group, sponsored posts)
  // People post examples:
  // - Friend post on his own profile
  // - Friend post on some group
  // - Friend is tagged in a post

  //  Friend posts exclude:
  // - People posts but have word "Follow" after profile name

  // Steps to find people posts:
  // 1. Find profile_name (data-ad-rendering-role="profile_name")
  // 2. Find Like button
  // 3. Find shared parent element
  // 4. from that, identify the Header part.
  // 5. Check header for element with href attribute contains "facebook.com/profile_name"
  // 6. Exclude if it has "Follow" after profile name

  const profileNameDiv = post.querySelector(
    'div[data-ad-rendering-role="profile_name"]'
  );
  if (!profileNameDiv) return false;

  const likeButton = post.querySelector('div[aria-label="Like"]');
  if (!likeButton) return false;

  let commonParent: Element | null = null;
  let headerDiv: Element | null = null;
  let actionDiv: Element | null = null;

  let headerEle = profileNameDiv;
  const headerEleSet = new Set<Element>();
  const headerChildMap: Map<Element, Element> = new Map();
  while (headerEle.parentElement !== post) {
    headerChildMap.set(headerEle.parentElement!, headerEle);
    headerEleSet.add(headerEle.parentElement!);
    headerEle = headerEle.parentElement!;
  }

  let actionEle = likeButton;
  const actionPath: Element[] = [];
  while (actionEle !== post) {
    actionPath.push(actionEle);
    if (headerEleSet.has(actionEle.parentElement!)) {
      commonParent = actionEle.parentElement!;
      headerDiv = headerChildMap.get(commonParent)!;
      actionDiv = actionEle;
      break;
    }
    actionEle = actionEle.parentElement!;
  }

  console.log('>>>> commonParent', commonParent);
  if (!commonParent || !headerDiv || !actionDiv) return false;

  let hasProfileLink = false;
  {
    const aElements = headerDiv.querySelectorAll(
      'a[href*="https://www.facebook.com"]'
    );

    const profileOrPageLinkElements = Array.from(aElements).filter(
      (a: Element) => {
        const href = a.getAttribute('href');
        if (!href) return false;
        const url = new URL(href);
        const pathname = url.pathname;
        return pathname.startsWith('/') && pathname.split('/').length === 2;
      }
    );

    hasProfileLink = profileOrPageLinkElements.length > 0;
  }
  if (!hasProfileLink) return false;

  const hasSpanWithTextFollow = Array.from(
    profileNameDiv.querySelectorAll('span')
  ).find((span) => span.textContent.includes('Follow'));

  const isSuggestedPost = hasSpanWithTextFollow;
  if (isSuggestedPost) return false;

  console.log('>>>> headerDiv', headerDiv);

  const adElement = headerDiv.querySelector('a[href^="/ads/about"]');
  console.log('>>>> adElement', adElement);
  if (!!adElement) return false;

  return true;
};

const friendSlugsRaw =
  'thuongtieubinh,tony.c.le.7,loc.ngo.2311,jasmine.le.9083,hieu.pham.999558,bich.thao.3958,ThanhLuongVu1311,cogai.trunghoa.150076,aurea.zaragoza,hien.pham.261401,mjnz.pham,chuavungve,mit.mai.35513,PhamMinhHop.HaTay,jfortich,Ally321159,trithong19,an.ngodangha,nguyen.thi.hong.iep.17087,linkin.viet,MaiThanhVinapco,nhi.thanh.58910,tran.tam.815291,ttng36,pdpn.071105,lehoangsang,nhungttk.hannah,dac.tai.1,apoteenix,ahn.hdt,pham.ong.148988,yobbo.pin,cesc.nguyen.877437,thanh.doan.150582,minhngocpk3003,greentea.pham,oni.musha.9,ngo.ngan.735,world.kk,phuong.nguyenthibich.79,xuxu10101992,linh.kua.1,HuyNokiChuong,quanghaotran1811,Thongpak.P,cuong.chau.79219,minhdaohcmcity,khanhtam.vu,thanhphong.tongoc,chu.mai.7,peevesthao,bui.hai.ly.131092,yen.nhien.523752,kim.nga.phan.319662,nguyen.thuy.683856,pham.quang.866000,ViPi.Daydreamer,nguyenvuluu,vanvinh.pham.180,tuydinh.doanthi,anhtinn,viettranx,nghia.nguyen.7792,le.quang.huy.42144,haha.lala.218,ailammoc.942269,ucpham.797077,bee.nguyen.37625,duongvo1901,xnam.cao,quang.leho,pham.huynhtien,panupak.vichaidit.2024,thanh.lan.43782,thanhtung.ho.710,chitrung.nguyen.9,chivt52,mai.ha.209991,thequyet.ngo,ha.huong.14,julia.tran.1588,nguyen.van.at.168381,codingz,thuan.dang.3382,kenji.tonoko,nguyenthiyen10111967,duytao.191191,kim.hue.569620,hahahaidang,bangkhanh198,Yuki.Au94,chau.phan.3388630,pham.b.khoa,nhung.ho.599960,SpartaTuan,kinhkeoday,steven.nguyen.10690,nguyenscorner,hoangtrungnguyen.2000,nhi.dnky,nganha.nguyenthi.50,vuong.le.6758,nonsensedotcom,pdnthanh,nguyetdieu.doan,linhnv3979,tungnt620,DoanThiBichLien.TamLien,hien.pham.787673,nguyenthuyan0304,nhatphamshop,trung.hoang.682061,khanh.huynh1993,HaiNguyen15101992,nhan.lenguyenthien.3,tran.nghia.768242,quynh.dinh.944,diep.triet.71818,dinhthuykimhien,catherine.xtn,thanhgiang.pham.56232938,cuonghh1,chelsea.bum.1,van.hanh.pham.905472,nhtt14,HannahThuquyen,minh.quan.193380,nguyen.ngocnga.7,vanducbri,nguyenphusi13,tieugiang91,mina.nguyen.39,doanbichchau,rickcysheng,HXuanTri,camellia.tran,bichtrantn,daring.selina,nguyen.minh.sang.937326,duy.pd1992,nddthien,daddywillvn,thanhvip1001hd,votran.hoangnhan,mai.nguyen.336,kentwinder,liyani.husain,justine.lamour.31,dana.scully.1829405,thuc.tran.374,yenoanhs,tran.ly.756,policehcmq1,truongtrinh.kei,ivy.koh2493,hoang.linh.893302,dinhthivutrinh,nguyet.thu.554015,KasuganoS,tri50ki,migosm,duc.doan.96780,thach.nguyen.31337194,thuy.nguyen.993637,hiennvn,ray.nguyen1408,anh.doano,trung.ngo.7374,phan.nhung.12,thanh.trung.501,long.ky.anh,ngo.thuy.590249,viet.le.630380,nguyen.tu.795357,tsuki.kyo.2024,nhut.vo.7773,mecghile,nhuy.phan.967,linh.vu.347349,laingoc.bichtram,kinh.nguyenviet,conangkieuki123,vuong.thuyvan.10,ykhoa.lt,quoc.minh.5621,na.ha.37819,BjbjBonBon.Pink,ldthanh.it,kenji.zf,vi.le.98892615,phamnhungbl,ngocthao.lai.5,tieu.hoai.1,quan.tran.859968,hoactp,nguyen.hoang.khue.tu,thienlethomas,madeleine.cao.87,nguyensyhiep,tranh0l,thanhtinh88,tran.quang.minh.080301,secretemmy.barbie,talamonmup,Janior.Truong,bin.le.777,dung.ng.1412,anh.tran.545,kim.thoia,shyssthanhtri,tram.bui.90,tranduylong8119,Tuvo3011,thuynhatminh.vo.3,haioanh789,minhnguyen.ttc,tranquoctuan89,bichthanh.doan.5,tnohtition,ha.nguyen.315428,nghia.hoang.608721,builong.11,bach.xuan,tuananhqn87,huuphuoc.10.92,lnhatminh,anhtuan.pham.5205622,WendyLee21,khuong.hoang.7,nhieuluongducthinh,Akexorcist,thangpd,xuanhoang1503,thuykieutien.huynh,luongphucthien,doansontung1986,phanphuongngon,thao.vy.630006,nguyenlenhungan,hmhiep92,nguyencaotrong2710,kimchau.tcnh,luka.norlaan,sonpx37,kenduTai,tuan.nhat.1,hatn88,trang.nguyenthiquynh,93.chan.le,tram.bich.340100,ngothituongvy2010,congly.dinh.7,nortrom.main,NguyenHoangThuyAn,av.luccis2,romrs,hannah.trang.9,huu.doanminh.5,nam.nguyen.465017,xhieu94,nhan.nguyen.971705,phuonglien43,ThuLucky,thisisericlewis,olong.410772,thanhnguyencongg,yuri.mi.7,thao.lam.5209,ngocnguyen.sky94,heo.moy.9,sg.phannguyen,nghia.baonghia,ap1610,nguyen.huuhieuhcm,tri.phan.77377,ngoc.dinh.7739,anphongsotuan,tin.nguyen.471811,lila.reze,tuyet.vo.58,nguyen.quoc.tuan.378340,conglx.152154,Tieumiu78,VietLH,tham.tran.378,huyen.hannahle,quocnhi.nguyenthi,Nhung.scl,ktsngovanhieu,moonbtn,son.pham.1848816,fayt.fanfan,nguyen.duchien.3,dongquyet,doanngochuy92,dat.duc.129,stam2168,iris.nguyen.58367,Haltp1987,bao.uyen.12,thu.quynh.74235,ngoc.n.oc,hhan191,Tran.BaoTran0104,ngoduc83,phivuong15,linhnguyen.fpt,eagle081183,duyanh.le.73,pham.son.260163,nguyen.h.phuong.752,Mr.HongQuan,page.trinh,baolinh1992,quangtien5523,HuyNgheNhan,descrnq,thanhyourealtor,hoai.nguyen.9256028,huynh.tram.585,thanh.jesus,zack.phan.9,simanh,ng.thihachi,Hienariel,trungnx26,nghi.huynh.84658,wuy.chinh.1,kyoera.fox,dangxuanhanh,phuc.pham.676540,don.le.56,do.duyhoa,tuan.dangthien.9,npnh.orangeism,thduoc,thanho.544339,Vinh.Dang.hello,Duongly.1503,htnvtnct,sam99799,lao.dung.7,phuc.ho666,huy.le.904,huycatalyst,vocotnhan,minhthao.nguyenle,thuha.tran.127,SonCa.PhanHuu,pham.yen.390408,le.yen.nhung.20251988,nguyen.ong.tru.2025,trang.le.925,ucnguyenquang.350689,vinh.cao.14,thanh.pham.543,hung.vuong.699458,huynhngoc.21,diemmydaiichi,thy.nguyen.5095,HDTQ2009,lananh186713,tu.diepthanh.58,nguyen.chi.thien.992873,jamexnguyen,sieubatnhao,patrick.tran25,duong.hamho,koy2312,tuongvy.hotran,Quang.Phu95,spectre.yoon,huynhquocvinh,huyen.trang.742410,hu.lomummim,hellonhitran,thientrung26,doanhuy1992,xuan.pham.176729,Daisoaikoten,bap.nho.503,tam.vu.663511,baoqn,Vrety,ReinoXCIII,quynh.nguyen.295140,khanh.nguyenngockieu,letruclan94,daothi.thuyliem,nguyen.nga.5682,thong.minh0708,quanghai.nguyen.3,hieupious,phamtandatdotcom,Dr.VPnS,iker.nguyen76,hannahduongthutrang,ngodinhlediem,kay.tpb,quachtrongnghia,tungduong051,annethuphan,hannahkieuoanh,nam.thang.91,chien.daoquang.71,nguyen.cuong.569782,tuan.a.phan.1,duong.thanh.609068,phongbv901,saobangnho91,naphan2007,doannguyen.minhchi,haovo.vo,dotien.dung.982,ThaoLamMobile,celinee.nguyen2196,lu.toan,hong.nguyen.755932,nguyen.thien.221356,rainshine142,TuanAnhFu,namrenzo,nguyen.thien.899860,tonlongtrieu,trung.chau.731,trandang247,kim.hang.669537,matador.datnguyen,nguyen.ngoc.danh.774527,darkknjght16,toan.huuich,hoang.anh.freelancer,le.khang.4138,rex.phan,cihmia,nguyenson161094,xuan.quang.821365,HuyNokiChuongg,anhla.thien,thien.ang.ngoc.2025,sakura.ngo,ibtran2,le.thi.bich.ly.164999,paminhui,vinh.doanthe,cndkhuong,huynh.d.trang.9,Mr.Kit179x,tripqm101,luanhuynhnhat,coganglennaobanoi,l.chikhanh,tam.seo,hieuhvcg,Jessydaynay,bach.voniem,sandy.yennhi,key.singum,huyenoanh.pham,tuanle.sg27,tien.le.737796,vananhfpt,le.t.thanh.35,TranNgocMinhNhu,doantrang.nguyen0494,hoangdc1705,nqtuan164.archive,lam.cuong.37,ami.akaru,lavie.vu92,phantatcong,trangnth.93,hoang.bac.7,nguyenthe.vinh.51,linhmp47,tien.nguyen.92351,minhtuando13,trandu93,vanngoctienvnt,sammie.thy,ToiLaTed,trinhnta1103,namdh2604,xuannuong.hothi,aloha.nguyen.919781,ocsendl,haibararan2003,milo2902,ken.kute.7,siu.n.bo,nghi.huynh.860029,natalie.le2312,phunhan.nguyen,nguyen.dinh.503612,NguyenThuyDung93,tan.m.pham,huycuongz,duongkhanhk29,Maimai2255,afterlastangel,balop93,le.tuan.anh.903977,hungnguyen27789,ngdoreen92,knock0u1,sinh.l.tran,relaxtime102,van.ngoc.165,pham.hiep.942,king.henry.961,pnnthao230194,hau.nguyen.16100,pham.tan.714357,Phoenixntp,hatasa.pinky,dung.hoa.7370,nguyen.ong.tru,lang.doan.696598,kenshinyh.kenshin,dong.maotrach,vanlang.doan.144,quenhu.duong,phamdao8100,eric.khoi,doanthanh.sang.16,nguyen.phan.963871,doan.bichtram.39,quyenthudam010,ACE.LSAT,phandinh.phuongnghi.9,canhpanda.canhpanda,minhthu.nguyen.524381,minhhop.pham.9,an.lucci,Daopm.Dean,me.imStrong.vn,hhanggnnguyenn,PhanNgocAnh333,hannah.funix.substitute,hannahkieungoc,nikik.mtl,anhdungsg,yen.nong.96,monkey.lovely11,thien.ma.96,nghiennet,minhtran2882,funix.hannahchamsoc,quyencao.hannah.5,hienpt.funix,TongdaiHocvuLaura,toan.le.5855,Tranlam.2905,pohuctroan,GemyPearl,quan.doan.927758,Acrobat.Wind.Walker,son.lamhoang,FPT.Education,jennifer.vu.5454,hthuong.tt,swizh.ah,2kute12,haicaubeo123,doreen2110,lequocthaitg,le.hang.33821,may.14792,huu.anhtuan,ping.red.106,pinkchoso,hanh.nhan.1044,as.al.52,emma.nguyen.7140,gaupoit,linhkua123,tra.honviet,harry.le.3990';
const friendSlugsSet = new Set(friendSlugsRaw.split(','));

export const isFriendPost = (post: Element) => {
  const profileNameDiv = post.querySelector(
    'div[data-ad-rendering-role="profile_name"]'
  );
  if (!profileNameDiv) return false;

  const likeButton = post.querySelector('div[aria-label="Like"]');
  if (!likeButton) return false;

  let commonParent: Element | null = null;
  let headerDiv: Element | null = null;
  let actionDiv: Element | null = null;

  let headerEle = profileNameDiv;
  const headerEleSet = new Set<Element>();
  const headerChildMap: Map<Element, Element> = new Map();
  while (headerEle.parentElement !== post) {
    headerChildMap.set(headerEle.parentElement!, headerEle);
    headerEleSet.add(headerEle.parentElement!);
    headerEle = headerEle.parentElement!;
  }

  let actionEle = likeButton;
  const actionPath: Element[] = [];
  while (actionEle !== post) {
    actionPath.push(actionEle);
    if (headerEleSet.has(actionEle.parentElement!)) {
      commonParent = actionEle.parentElement!;
      headerDiv = headerChildMap.get(commonParent)!;
      actionDiv = actionEle;
      break;
    }
    actionEle = actionEle.parentElement!;
  }

  if (!commonParent || !headerDiv || !actionDiv) return false;

  const aElements = headerDiv.querySelectorAll('a');
  const foundFriendSlugElement = Array.from(aElements).find((a) => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('https://www.facebook.com')) return false;
    const url = new URL(href);
    const pathname = url.pathname;
    if (pathname.split('/').length !== 2) return false;
    const slug = pathname.split('/')[1];
    const isFriendSlug = friendSlugsSet.has(slug);
    return isFriendSlug;
  });

  return !!foundFriendSlugElement;
};
