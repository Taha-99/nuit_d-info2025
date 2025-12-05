import React from 'react';
import { Box, Paper, Stack, Typography, Grid, Card, CardContent, Divider, Avatar, Chip } from '@mui/material';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';
import PublicIcon from '@mui/icons-material/Public';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import VerifiedIcon from '@mui/icons-material/Verified';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const AboutPage = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: <PublicIcon sx={{ fontSize: 40 }} />,
      title: { fr: 'Accessibilité Universelle', ar: 'إتاحة شاملة' },
      description: { 
        fr: 'Application conçue pour fonctionner même avec une connexion internet limitée, garantissant l\'accès aux services publics pour tous.',
        ar: 'تطبيق مصمم للعمل حتى مع اتصال إنترنت محدود، يضمن الوصول إلى الخدمات العامة للجميع.'
      },
      color: '#8c6cff'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: { fr: 'Sécurité Renforcée', ar: 'أمان معزز' },
      description: {
        fr: 'Protection des données personnelles avec chiffrement de bout en bout et conformité aux normes RGPD.',
        ar: 'حماية البيانات الشخصية مع تشفير من طرف إلى طرف والامتثال لمعايير حماية البيانات.'
      },
      color: '#4ef0d0'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: { fr: 'Performance Optimale', ar: 'أداء مثالي' },
      description: {
        fr: 'Interface rapide et réactive grâce à l\'IA hybride combinant traitement local et cloud.',
        ar: 'واجهة سريعة وتفاعلية بفضل الذكاء الاصطناعي الهجين الذي يجمع بين المعالجة المحلية والسحابية.'
      },
      color: '#ffd54f'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: { fr: 'Inclusion Numérique', ar: 'الإدماج الرقمي' },
      description: {
        fr: 'Interface bilingue français/arabe adaptée aux besoins de tous les citoyens algériens.',
        ar: 'واجهة ثنائية اللغة (فرنسية/عربية) مكيفة لاحتياجات جميع المواطنين الجزائريين.'
      },
      color: '#ff8a65'
    },
  ];

  const stats = [
    { value: '180+', label: { fr: 'Services guidés', ar: 'خدمة موجهة' } },
    { value: '24/7', label: { fr: 'Disponibilité', ar: 'متاح على مدار الساعة' } },
    { value: '2', label: { fr: 'Langues supportées', ar: 'لغات مدعومة' } },
    { value: '100%', label: { fr: 'Open Source', ar: 'مفتوح المصدر' } },
  ];

  const team = [
    { name: 'NIRD Team', role: { fr: 'Développement & Design', ar: 'التطوير والتصميم' }, avatar: 'N' },
    { name: 'Ministère de l\'Intérieur', role: { fr: 'Partenaire Institutionnel', ar: 'شريك مؤسسي' }, avatar: 'M' },
    { name: 'Communauté Open Source', role: { fr: 'Contributeurs', ar: 'المساهمون' }, avatar: 'O' },
  ];

  const technologies = [
    'React', 'Node.js', 'MongoDB', 'OpenRouter AI', 'Qwen', 'Material UI', 'PWA', 'IndexedDB'
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%' }}>
        <Stack spacing={5}>
          {/* Hero Section */}
          <Paper sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(8,12,30,0.95), rgba(14,20,50,0.9))',
            border: '1px solid rgba(142,91,255,0.3)',
          }}>
            <Stack spacing={3} alignItems="center">
              <EmojiObjectsIcon sx={{ fontSize: 80, color: 'primary.main' }} />
              <Typography variant="h2" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                {language === 'ar' ? 'مساعد الخدمات الحكومية' : 'IA Low-Cost Assistant'}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800 }}>
                {language === 'ar' 
                  ? 'منصة ذكية لتبسيط الإجراءات الإدارية وتقريب الخدمات العمومية من المواطنين الجزائريين'
                  : 'Une plateforme intelligente pour simplifier les démarches administratives et rapprocher les services publics des citoyens algériens'
                }
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip label="🇩🇿 Made in Algeria" color="primary" />
                <Chip label="Open Source" variant="outlined" />
                <Chip label="Offline-First" variant="outlined" />
              </Stack>
            </Stack>
          </Paper>

          {/* Stats Section */}
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: 'rgba(140,108,255,0.1)',
                  border: '1px solid rgba(140,108,255,0.3)',
                }}>
                  <Typography variant="h3" fontWeight={700} color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography color="text.secondary">
                    {stat.label[language]}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Mission Section */}
          <Paper sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <VerifiedIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h4" fontWeight={700}>
                  {language === 'ar' ? 'مهمتنا' : 'Notre Mission'}
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {language === 'ar'
                  ? 'نسعى إلى جعل الخدمات الحكومية في متناول جميع المواطنين الجزائريين، بغض النظر عن موقعهم الجغرافي أو جودة اتصالهم بالإنترنت. من خلال استخدام تقنيات الذكاء الاصطناعي المتقدمة والتصميم الذي يركز على المستخدم، نقدم تجربة سلسة وفعالة للحصول على المعلومات وإتمام الإجراءات الإدارية.'
                  : 'Nous œuvrons pour rendre les services gouvernementaux accessibles à tous les citoyens algériens, quel que soit leur emplacement géographique ou la qualité de leur connexion internet. Grâce à l\'utilisation de technologies d\'intelligence artificielle avancées et à une conception centrée sur l\'utilisateur, nous offrons une expérience fluide et efficace pour obtenir des informations et accomplir les démarches administratives.'
                }
              </Typography>
              <Divider />
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {language === 'ar'
                  ? 'تم تطوير هذا المشروع في إطار مبادرة NIRD (الرقمية الشاملة والمرنة من أجل التنمية) بهدف سد الفجوة الرقمية وضمان المساواة في الوصول إلى الخدمات العمومية.'
                  : 'Ce projet a été développé dans le cadre de l\'initiative NIRD (Numérique Inclusif et Résilient pour le Développement) avec pour objectif de combler la fracture numérique et garantir l\'égalité d\'accès aux services publics.'
                }
              </Typography>
            </Stack>
          </Paper>

          {/* Features Grid */}
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
              {language === 'ar' ? 'الميزات الرئيسية' : 'Fonctionnalités Clés'}
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    border: `2px solid ${feature.color}20`,
                    '&:hover': { borderColor: feature.color },
                    transition: 'all 0.3s',
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box sx={{ color: feature.color }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          {feature.title[language]}
                        </Typography>
                        <Typography color="text.secondary">
                          {feature.description[language]}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Technologies */}
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {language === 'ar' ? 'التقنيات المستخدمة' : 'Technologies Utilisées'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
              {technologies.map((tech, index) => (
                <Chip 
                  key={index} 
                  label={tech} 
                  variant="outlined" 
                  sx={{ 
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.main', color: 'white' }
                  }} 
                />
              ))}
            </Stack>
          </Paper>

          {/* Team Section */}
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {language === 'ar' ? 'الفريق والشركاء' : 'Équipe & Partenaires'}
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {team.map((member, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {member.avatar}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>{member.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.role[language]}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Credits & Links */}
          <Paper sx={{ p: 4, background: 'rgba(78,240,208,0.05)', border: '1px solid rgba(78,240,208,0.2)' }}>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={600}>
                {language === 'ar' ? 'شكر وتقدير' : 'Crédits & Remerciements'}
              </Typography>
              <Typography color="text.secondary">
                {language === 'ar'
                  ? 'شكر خاص لجميع المساهمين في مجتمع المصادر المفتوحة الذين جعلوا هذا المشروع ممكنًا. الأيقونات من Material Design، والتوضيحات مجانية الحقوق.'
                  : 'Un grand merci à tous les contributeurs de la communauté open-source qui ont rendu ce projet possible. Les icônes proviennent de Material Design, et les illustrations sont libres de droits.'
                }
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip 
                  icon={<GitHubIcon />} 
                  label="GitHub" 
                  clickable 
                  onClick={() => window.open('https://github.com', '_blank')}
                />
                <Chip 
                  icon={<LinkedInIcon />} 
                  label="LinkedIn" 
                  clickable 
                  onClick={() => window.open('https://linkedin.com', '_blank')}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 NIRD - {language === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default AboutPage;
