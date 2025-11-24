import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Rate {
  final String code;
  final double value;

  Rate({required this.code, required this.value});
}

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fixer Rates',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      home: const RatesPage(),
    );
  }
}

class RatesPage extends StatefulWidget {
  const RatesPage({super.key});

  @override
  State<RatesPage> createState() => _RatesPageState();
}

class _RatesPageState extends State<RatesPage> {
  bool _loading = true;
  String? _error;
  List<Rate> _rates = const [];

  @override
  void initState() {
    super.initState();
    _fetchRates();
  }

  Future<void> _fetchRates() async {
    const fixerApiKey = 'ee06148b9ebfafa5ff4368add786aba9';
    final uri = Uri.parse(
      'https://data.fixer.io/api/latest?access_key=$fixerApiKey',
    );

    try {
      final res = await http.get(uri);
      if (res.statusCode != 200) {
        setState(() {
          _error = 'HTTP ${res.statusCode}';
          _loading = false;
        });
        return;
      }

      final jsonBody = json.decode(res.body) as Map<String, dynamic>;
      final success = jsonBody['success'] == true;

      if (!success) {
        final err = (jsonBody['error']?['type'] ?? 'Unknown error').toString();
        setState(() {
          _error = err;
          _loading = false;
        });
        return;
      }

      final ratesMap = (jsonBody['rates'] as Map<String, dynamic>);
      final list =
          ratesMap.entries
              .map((e) => Rate(code: e.key, value: (e.value as num).toDouble()))
              .toList()
            ..sort((a, b) => a.code.compareTo(b.code));

      setState(() {
        _rates = list;
        _loading = false;
      });
    } catch (e, st) {
      // ✅ avoid print in production
      debugPrint('Fixer fetch error: $e\n$st');
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final body = _loading
        ? const Center(child: CircularProgressIndicator())
        : (_error != null)
        ? Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 42),
                const SizedBox(height: 12),
                Text('Failed to load rates: $_error'),
                const SizedBox(height: 8),
                FilledButton.icon(
                  onPressed: () {
                    setState(() {
                      _loading = true;
                      _error = null;
                    });
                    _fetchRates();
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                ),
              ],
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: _rates.length,
            itemBuilder: (_, i) {
              final r = _rates[i];
              return Card(
                elevation: 2,
                margin: const EdgeInsets.symmetric(vertical: 6),
                child: ListTile(
                  leading: CircleAvatar(child: Text(r.code.substring(0, 1))),
                  title: Text(r.code), // ✅ no unnecessary interpolation
                  subtitle: const Text('Rate vs base currency'),
                  trailing: Text(
                    r.value.toStringAsFixed(4),
                    style: const TextStyle(
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
              );
            },
          );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fixer.io – Latest Rates'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () {
              setState(() {
                _loading = true;
                _error = null;
              });
              _fetchRates();
            },
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: body,
    );
  }
}
