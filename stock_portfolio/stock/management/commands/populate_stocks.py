from django.core.management.base import BaseCommand
from stock.models import Sector, Stock


class Command(BaseCommand):
    help = 'Populate database with stocks for each sector'

    def handle(self, *args, **options):
        # Define sector data with stocks
        sectors_data = {
            'IT': [
                {'name': 'Apple Inc.', 'symbol': 'AAPL', 'description': 'Consumer electronics and software'},
                {'name': 'Microsoft Corporation', 'symbol': 'MSFT', 'description': 'Cloud computing and productivity software'},
                {'name': 'Google (Alphabet)', 'symbol': 'GOOGL', 'description': 'Search engine and advertising platform'},
                {'name': 'Meta Platforms', 'symbol': 'META', 'description': 'Social media and digital advertising'},
                {'name': 'Intel Corporation', 'symbol': 'INTC', 'description': 'Semiconductor manufacturing'},
                {'name': 'Nvidia Corporation', 'symbol': 'NVDA', 'description': 'GPU and AI chip design'},
                {'name': 'Cisco Systems', 'symbol': 'CSCO', 'description': 'Networking and cybersecurity'},
                {'name': 'IBM', 'symbol': 'IBM', 'description': 'Enterprise IT services'},
                {'name': 'Oracle Corporation', 'symbol': 'ORCL', 'description': 'Database and cloud solutions'},
                {'name': 'Salesforce', 'symbol': 'CRM', 'description': 'Customer relationship management'},
                {'name': 'Adobe Inc.', 'symbol': 'ADBE', 'description': 'Creative and document software'},
                {'name': 'VMware', 'symbol': 'VMW', 'description': 'Virtualization software'},
            ],
            'Banking': [
                {'name': 'JPMorgan Chase', 'symbol': 'JPM', 'description': 'Leading investment bank'},
                {'name': 'Bank of America', 'symbol': 'BAC', 'description': 'Major commercial bank'},
                {'name': 'Wells Fargo', 'symbol': 'WFC', 'description': 'Diversified financial services'},
                {'name': 'Citigroup', 'symbol': 'C', 'description': 'Global banking corporation'},
                {'name': 'Goldman Sachs', 'symbol': 'GS', 'description': 'Investment banking firm'},
                {'name': 'Morgan Stanley', 'symbol': 'MS', 'description': 'Investment and wealth management'},
                {'name': 'State Street', 'symbol': 'STT', 'description': 'Financial services and banking'},
                {'name': 'Charles Schwab', 'symbol': 'SCHW', 'description': 'Investment brokerage'},
                {'name': 'HDFC Bank', 'symbol': 'HDFCBANK.NS', 'description': 'Leading Indian private bank'},
                {'name': 'ICICI Bank', 'symbol': 'ICICIBANK.NS', 'description': 'Major Indian banking corporation'},
                {'name': 'State Bank of India', 'symbol': 'SBIN.NS', 'description': 'Government-owned Indian bank'},
                {'name': 'Axis Bank', 'symbol': 'AXISBANK.NS', 'description': 'Private sector Indian bank'},
            ],
            'Automobile': [
                {'name': 'Tesla Inc.', 'symbol': 'TSLA', 'description': 'Electric vehicles and clean energy'},
                {'name': 'Ford Motor Company', 'symbol': 'F', 'description': 'Traditional automaker'},
                {'name': 'General Motors', 'symbol': 'GM', 'description': 'Major automotive manufacturer'},
                {'name': 'Toyota Motor', 'symbol': 'TM', 'description': 'Japanese automotive leader'},
                {'name': 'Honda Motor', 'symbol': 'HMC', 'description': 'Japanese automaker'},
                {'name': 'BMW Group', 'symbol': 'BMWYY', 'description': 'Luxury automobile manufacturer'},
                {'name': 'Mercedes-Benz', 'symbol': 'MBGYY', 'description': 'Premium automotive brand'},
                {'name': 'Volkswagen', 'symbol': 'VWAGY', 'description': 'German automaker'},
                {'name': 'Maruti Suzuki', 'symbol': 'MARUTI.NS', 'description': 'Leading Indian automaker'},
                {'name': 'Tata Motors', 'symbol': 'TATAMOTORS.NS', 'description': 'Major Indian automotive company'},
                {'name': 'Bajaj Auto', 'symbol': 'BAJAJAUT01.NS', 'description': 'Indian two-wheeler manufacturer'},
                {'name': 'Hero MotoCorp', 'symbol': 'HEROMOTOCO.NS', 'description': 'Indian two-wheeler company'},
            ],
            'TATA': [
                {'name': 'Tata Consultancy Services', 'symbol': 'TCS.NS', 'description': 'Leading Indian IT services'},
                {'name': 'Tata Steel', 'symbol': 'TATASTEEL.NS', 'description': 'Major steel manufacturer'},
                {'name': 'Tata Motors', 'symbol': 'TATAMOTORS.NS', 'description': 'Automotive and engineering'},
                {'name': 'Taj Hotels', 'symbol': 'TAJHOTELS.NS', 'description': 'Luxury hospitality chain'},
                {'name': 'Tata Power', 'symbol': 'TATAPOWER.NS', 'description': 'Energy and power generation'},
                {'name': 'Tata Communications', 'symbol': 'TATACOMM.NS', 'description': 'Telecom services'},
                {'name': 'Titan Company', 'symbol': 'TITAN.NS', 'description': 'Jewelry and watches'},
                {'name': 'Voltas Limited', 'symbol': 'VOLTAS.NS', 'description': 'HVAC and cooling solutions'},
                {'name': 'Indian Hotels', 'symbol': 'INDHOTEL.NS', 'description': 'Hotel and hospitality'},
                {'name': 'Tata Chemicals', 'symbol': 'TATACHEM.NS', 'description': 'Chemical manufacturing'},
                {'name': 'Tata Investment', 'symbol': 'TATAINVEST.NS', 'description': 'Investment company'},
                {'name': 'Rallis India', 'symbol': 'RALLIS.NS', 'description': 'Agrochemicals company'},
            ],
            'Adani': [
                {'name': 'Adani Enterprises', 'symbol': 'ADANIENTERP.NS', 'description': 'Diversified conglomerate'},
                {'name': 'Adani Ports', 'symbol': 'ADANIPORTS.NS', 'description': 'Port and logistics operator'},
                {'name': 'Adani Power', 'symbol': 'ADANIPOWER.NS', 'description': 'Thermal power generation'},
                {'name': 'Adani Transmission', 'symbol': 'ADANIGREEN.NS', 'description': 'Power transmission'},
                {'name': 'Adani Green Energy', 'symbol': 'ADANIGREEN.NS', 'description': 'Renewable energy company'},
                {'name': 'NDTV Limited', 'symbol': 'NDTV.NS', 'description': 'Media and broadcasting'},
                {'name': 'Adani Wilmar', 'symbol': 'ADANIHOLDI.NS', 'description': 'Food and edible oils'},
                {'name': 'Adani Total Gas', 'symbol': 'ADANITRANS.NS', 'description': 'Gas distribution network'},
                {'name': 'Adani Logistics', 'symbol': 'ADANILOG.NS', 'description': 'Logistics and supply chain'},
                {'name': 'Adani Global', 'symbol': 'ADANIGLOBAL.NS', 'description': 'Global business operations'},
                {'name': 'Adani Healthcare', 'symbol': 'ADANIHEAL.NS', 'description': 'Healthcare services'},
                {'name': 'Adani Energy Solutions', 'symbol': 'ADANENRGY.NS', 'description': 'Energy solutions provider'},
            ],
        }

        # Get or create sectors and add stocks
        for sector_name, stocks in sectors_data.items():
            sector, created = Sector.objects.get_or_create(
                name=sector_name,
                defaults={'description': f'{sector_name} Sector'}
            )
            
            for stock_data in stocks:
                stock, created = Stock.objects.get_or_create(
                    symbol=stock_data['symbol'],
                    defaults={
                        'name': stock_data['name'],
                        'sector': sector,
                        'description': stock_data['description'],
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created {stock.name} ({stock.symbol}) in {sector_name}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Stock {stock.symbol} already exists'
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with stocks!')
        )
