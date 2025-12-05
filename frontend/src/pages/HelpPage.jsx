import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArticleIcon from '@mui/icons-material/Article';
import NavBar from '../components/NavBar';
import { useLanguage } from '../contexts/LanguageContext';

const faqData = {
  general: [
    {
      question: 'Comment créer un compte ?',
      questionAr: 'كيف أنشئ حسابًا؟',
      answer: 'Cliquez sur "S\'inscrire" dans la barre de navigation, remplissez le formulaire avec vos informations personnelles et validez votre email.',
      answerAr: 'انقر على "تسجيل" في شريط التنقل، واملأ النموذج بمعلوماتك الشخصية وتحقق من بريدك الإلكتروني.',
    },
    {
      question: 'Comment réinitialiser mon mot de passe ?',
      questionAr: 'كيف أعيد تعيين كلمة المرور؟',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions envoyées par email.',
      answerAr: 'في صفحة تسجيل الدخول، انقر على "نسيت كلمة المرور" واتبع التعليمات المرسلة عبر البريد الإلكتروني.',
    },
    {
      question: 'L\'application fonctionne-t-elle hors ligne ?',
      questionAr: 'هل يعمل التطبيق بدون إنترنت؟',
      answer: 'Oui ! L\'assistant IA dispose d\'un mode hors ligne qui vous permet d\'accéder aux informations essentielles même sans connexion internet.',
      answerAr: 'نعم! يحتوي مساعد الذكاء الاصطناعي على وضع غير متصل يتيح لك الوصول إلى المعلومات الأساسية حتى بدون اتصال بالإنترنت.',
    },
  ],
  documents: [
    {
      question: 'Quels documents sont nécessaires pour une carte d\'identité ?',
      questionAr: 'ما هي الوثائق المطلوبة لبطاقة الهوية؟',
      answer: 'Acte de naissance (S12), certificat de résidence, 2 photos d\'identité récentes, et formulaire de demande rempli.',
      answerAr: 'شهادة الميلاد (S12)، شهادة الإقامة، صورتان شخصيتان حديثتان، واستمارة الطلب مملوءة.',
    },
    {
      question: 'Comment suivre l\'état de ma demande ?',
      questionAr: 'كيف أتابع حالة طلبي؟',
      answer: 'Accédez à la page "Suivi des documents" dans le menu, entrez votre numéro de suivi pour voir l\'avancement de votre demande.',
      answerAr: 'ادخل إلى صفحة "متابعة الوثائق" في القائمة، وأدخل رقم التتبع الخاص بك لمشاهدة تقدم طلبك.',
    },
    {
      question: 'Combien de temps prend le traitement d\'un passeport ?',
      questionAr: 'كم يستغرق معالجة جواز السفر؟',
      answer: 'Le délai moyen est de 2 à 4 semaines. Vous serez notifié par SMS/email lorsque votre passeport sera prêt.',
      answerAr: 'المدة المتوسطة هي 2 إلى 4 أسابيع. سيتم إعلامك عبر الرسائل القصيرة / البريد الإلكتروني عندما يكون جواز سفرك جاهزًا.',
    },
  ],
  appointments: [
    {
      question: 'Comment prendre un rendez-vous ?',
      questionAr: 'كيف أحجز موعدًا؟',
      answer: 'Allez dans la section "Rendez-vous", sélectionnez le service souhaité, choisissez une date et un créneau horaire disponible.',
      answerAr: 'اذهب إلى قسم "المواعيد"، واختر الخدمة المطلوبة، ثم حدد تاريخًا وفترة زمنية متاحة.',
    },
    {
      question: 'Puis-je annuler ou reporter un rendez-vous ?',
      questionAr: 'هل يمكنني إلغاء أو تأجيل موعد؟',
      answer: 'Oui, vous pouvez modifier ou annuler un rendez-vous jusqu\'à 24 heures avant la date prévue via la page "Rendez-vous".',
      answerAr: 'نعم، يمكنك تعديل أو إلغاء موعد حتى 24 ساعة قبل التاريخ المحدد عبر صفحة "المواعيد".',
    },
    {
      question: 'Que faire si je rate mon rendez-vous ?',
      questionAr: 'ماذا أفعل إذا فاتني موعدي؟',
      answer: 'Vous devrez prendre un nouveau rendez-vous. Après 3 absences non justifiées, votre compte peut être temporairement suspendu.',
      answerAr: 'سيتعين عليك حجز موعد جديد. بعد 3 غيابات غير مبررة، قد يتم تعليق حسابك مؤقتًا.',
    },
  ],
  assistant: [
    {
      question: 'L\'assistant IA comprend-il l\'arabe ?',
      questionAr: 'هل يفهم المساعد الذكاء الاصطناعي العربية؟',
      answer: 'Oui, l\'assistant est bilingue et peut répondre en français ou en arabe selon votre préférence.',
      answerAr: 'نعم، المساعد ثنائي اللغة ويمكنه الرد بالفرنسية أو العربية حسب تفضيلاتك.',
    },
    {
      question: 'Mes conversations sont-elles sauvegardées ?',
      questionAr: 'هل يتم حفظ محادثاتي؟',
      answer: 'Oui, vos conversations sont sauvegardées de manière sécurisée pour vous permettre de reprendre où vous vous êtes arrêté.',
      answerAr: 'نعم، يتم حفظ محادثاتك بشكل آمن لتتمكن من استئناف حيث توقفت.',
    },
    {
      question: 'L\'assistant peut-il remplir des formulaires pour moi ?',
      questionAr: 'هل يمكن للمساعد ملء النماذج نيابة عني؟',
      answer: 'L\'assistant peut vous guider étape par étape pour remplir les formulaires, mais le remplissage automatique n\'est pas encore disponible.',
      answerAr: 'يمكن للمساعد إرشادك خطوة بخطوة لملء النماذج، لكن الملء التلقائي غير متاح بعد.',
    },
  ],
};

const contactInfo = [
  {
    icon: PhoneIcon,
    label: { fr: 'Téléphone', ar: 'الهاتف' },
    value: '+213 21 XX XX XX',
    action: 'tel:+21321XXXXXX',
  },
  {
    icon: EmailIcon,
    label: { fr: 'Email', ar: 'البريد الإلكتروني' },
    value: 'support@nird.gov.dz',
    action: 'mailto:support@nird.gov.dz',
  },
  {
    icon: LocationOnIcon,
    label: { fr: 'Adresse', ar: 'العنوان' },
    value: { fr: 'Ministère de l\'Intérieur, Alger', ar: 'وزارة الداخلية، الجزائر' },
    action: null,
  },
];

const HelpPage = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const categories = [
    { key: 'general', label: { fr: 'Général', ar: 'عام' } },
    { key: 'documents', label: { fr: 'Documents', ar: 'الوثائق' } },
    { key: 'appointments', label: { fr: 'Rendez-vous', ar: 'المواعيد' } },
    { key: 'assistant', label: { fr: 'Assistant IA', ar: 'المساعد الذكي' } },
  ];

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const filterFaqs = (faqs) => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.questionAr.includes(searchQuery) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.answerAr.includes(searchQuery)
    );
  };

  const currentCategory = categories[activeTab].key;
  const filteredFaqs = filterFaqs(faqData[currentCategory]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 6 }, flex: 1, width: '100%' }}>
        <Stack spacing={4}>
          {/* Header */}
          <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, rgba(8,12,30,0.9), rgba(9,16,42,0.9))' }}>
            <HelpOutlineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight={700}>
              {language === 'ar' ? 'مركز المساعدة' : 'Centre d\'aide'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {language === 'ar' 
                ? 'ابحث في الأسئلة الشائعة أو اتصل بفريق الدعم'
                : 'Recherchez dans la FAQ ou contactez notre équipe de support'
              }
            </Typography>
            
            {/* Search */}
            <TextField
              fullWidth
              placeholder={language === 'ar' ? 'ابحث في الأسئلة الشائعة...' : 'Rechercher dans la FAQ...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ maxWidth: 600, mx: 'auto' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {/* Category Tabs */}
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600,
                },
              }}
            >
              {categories.map((cat, index) => (
                <Tab 
                  key={cat.key} 
                  label={cat.label[language]}
                  icon={<ArticleIcon />}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>

          {/* FAQ Accordions */}
          <Box>
            {filteredFaqs.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {language === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}
                </Typography>
              </Paper>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Accordion
                  key={index}
                  expanded={expanded === `panel${index}`}
                  onChange={handleAccordionChange(`panel${index}`)}
                  sx={{
                    mb: 1,
                    '&:before': { display: 'none' },
                    border: '1px solid rgba(255,255,255,0.08)',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': { my: 2 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <HelpOutlineIcon color="primary" />
                      <Typography fontWeight={600}>
                        {language === 'ar' ? faq.questionAr : faq.question}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                    <Typography color="text.secondary" sx={{ pl: 5 }}>
                      {language === 'ar' ? faq.answerAr : faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>

          {/* Contact Section */}
          <Paper sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ContactSupportIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={600}>
                  {language === 'ar' ? 'تواصل معنا' : 'Contactez-nous'}
                </Typography>
              </Stack>
              
              <Typography color="text.secondary">
                {language === 'ar'
                  ? 'لم تجد إجابة لسؤالك؟ تواصل مع فريق الدعم الفني.'
                  : 'Vous n\'avez pas trouvé de réponse ? Contactez notre équipe de support.'
                }
              </Typography>

              <Grid container spacing={3}>
                {contactInfo.map((contact, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        cursor: contact.action ? 'pointer' : 'default',
                        '&:hover': contact.action ? { borderColor: 'primary.main' } : {},
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      onClick={() => contact.action && window.open(contact.action)}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <contact.icon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {contact.label[language]}
                            </Typography>
                            <Typography fontWeight={600}>
                              {typeof contact.value === 'object' ? contact.value[language] : contact.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                size="large"
                startIcon={<ContactSupportIcon />}
                sx={{ alignSelf: 'center', mt: 2 }}
              >
                {language === 'ar' ? 'إرسال رسالة' : 'Envoyer un message'}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default HelpPage;
